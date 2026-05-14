import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Преобразует дату и время из payload в единый JS Date.
function toStartAt(dates) {
  if (!dates?.start_date) return null;
  const time = dates.start_time || "00:00";
  return new Date(`${dates.start_date}T${time}:00`);
}

// Поддерживает разные форматы webhook и всегда возвращает массив событий.
function extractEvents(body) {
  if (Array.isArray(body?.events)) return body.events;
  if (body?.id && body?.name) return [body];
  if (body?.event?.id && body?.event?.name) return [body.event];
  if (body?.data?.id && body?.data?.name) return [body.data];
  if (body?.payload?.id && body?.payload?.name) return [body.payload];
  return [];
}

// Удаляет дубликаты и отбрасывает пустые/некорректные значения.
function uniqueStrings(values) {
  return [
    ...new Set(values.filter((v) => typeof v === "string" && v.trim() !== "")),
  ];
}

// Упрощает classification до массивов строк для хранения в Event.
function extractClassification(payload) {
  const themes = uniqueStrings(
    (payload.classification?.themes || []).map((theme) => theme?.name),
  );
  const genres = uniqueStrings(
    (payload.classification?.themes || []).flatMap(
      (theme) => theme?.genres || [],
    ),
  );
  const types = uniqueStrings(payload.classification?.types || []);
  return { themes, genres, types };
}

function extractSourceUrl(payload) {
  const photos = Array.isArray(payload.photos) ? payload.photos : [];
  const original = photos.find((photo) => photo?.type === "original");
  return original?.url || null;
}

// Возвращает имя файла постера из URL (можно использовать позже как S3 key).
function extractPhotoFileName(payload) {
  const sourceUrl = extractSourceUrl(payload);
  if (!sourceUrl) return null;

  try {
    const pathname = new URL(sourceUrl).pathname;
    return pathname.split("/").pop() || null;
  } catch {
    return sourceUrl.split("/").pop() || null;
  }
}

export async function POST(req) {
  try {
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

            // 3) Потом Media (Media хранит eventId).
            const sourceUrl = extractSourceUrl(payload);
            if (sourceUrl) {
              await tx.media.upsert({
                where: { eventId: upsertedEvent.id },
                create: {
                  eventId: upsertedEvent.id,
                  sourceUrl,
                },
                update: {
                  sourceUrl,
                },
              });
            }

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
