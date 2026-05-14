import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  extractClassification,
  extractEvents,
  toStartAt,
} from "@/lib/events/payload";
import { syncEventMedia } from "@/lib/events/media";

export async function POST(req) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const receivedToken = authHeader.split(" ")[1];

    const clientToken = process.env.WEBHOOK_TOKEN;

    if (receivedToken !== clientToken) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const events = extractEvents(body);

    // Быстро возвращаем 400, если в webhook нет пригодной структуры события.
    if (events.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "Event payload not found. Expected event object or events[].",
          receivedKeys:
            body && typeof body === "object" ? Object.keys(body) : [],
        },
        { status: 400 },
      );
    }

    const saved = [];
    const errors = [];

    // Важно: обрабатываем строго последовательно, по одному событию за раз.
    // Это снижает риск перегрузки и таймаутов на больших webhook-пакетах.
    for (let index = 0; index < events.length; index += 1) {
      const payload = events[index];
      if (!payload?.id || !payload?.name) {
        errors.push({
          index,
          id: payload?.id ?? null,
          error: "Missing id or name",
        });
        continue;
      }

      try {
        const classification = extractClassification(payload);

        // Транзакция на одно событие:
        // 1) upsert места (если есть)
        // 2) upsert события с упрощенной classification
        const event = await prisma.$transaction(
          async (tx) => {
            // 1) Сначала Place (Event хранит placeId).
            let placeId = null;
            if (payload.place?.id) {
              const place = await tx.place.upsert({
                where: { externalId: payload.place.id },
                create: {
                  externalId: payload.place.id,
                  city: payload.place.city || "Unknown",
                  company: payload.place.company || null,
                  street: payload.place.street || null,
                  latitude: payload.place?.wgs84?.latitude ?? null,
                  longitude: payload.place?.wgs84?.longitude ?? null,
                },
                update: {
                  city: payload.place.city || "Unknown",
                  company: payload.place.company || null,
                  street: payload.place.street || null,
                  latitude: payload.place?.wgs84?.latitude ?? null,
                  longitude: payload.place?.wgs84?.longitude ?? null,
                },
              });
              placeId = place.id;
            }

            // 2) Затем Event с placeId.
            const upsertedEvent = await tx.event.upsert({
              where: { externalId: payload.id },
              create: {
                externalId: payload.id,
                name: payload.name,
                bookingUrl: payload.booking_url ?? null,
                facebookEventId: payload.facebook_event_id ?? null,
                startAt: toStartAt(payload.dates),
                description: payload.description?.text ?? null,
                entranceFee: payload.details?.entrance_fee ?? null,
                detailsUrl: payload.details?.url ?? null,
                themes: classification.themes,
                genres: classification.genres,
                types: classification.types,
                placeId,
              },
              update: {
                name: payload.name,
                bookingUrl: payload.booking_url ?? null,
                facebookEventId: payload.facebook_event_id ?? null,
                startAt: toStartAt(payload.dates),
                description: payload.description?.text ?? null,
                entranceFee: payload.details?.entrance_fee ?? null,
                detailsUrl: payload.details?.url ?? null,
                themes: classification.themes,
                genres: classification.genres,
                types: classification.types,
                placeId,
              },
            });

            // 3) Медиа: синхронизация sourceUrl + условная загрузка в R2.
            await syncEventMedia({
              tx,
              eventId: upsertedEvent.id,
              payload,
            });

            return upsertedEvent;
          },
          { maxWait: 10000, timeout: 20000 },
        );

        saved.push({ id: event.id, externalId: event.externalId });
      } catch (err) {
        // Даже если одно событие упало, продолжаем обработку остальных.
        errors.push({
          index,
          id: payload.id ?? null,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    // Возвращаем сводку по батчу для webhook-отправителя и отладки.
    return NextResponse.json({
      ok: errors.length === 0,
      totalReceived: events.length,
      savedCount: saved.length,
      failedCount: errors.length,
      saved,
      errors,
    });
  } catch (error) {
    console.error("POST /api/events failed:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to ingest event" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: {
        place: true,
        media: true,
      },
    });

    return NextResponse.json({ ok: true, events });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to load events",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
