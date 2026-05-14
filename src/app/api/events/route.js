import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function toStartAt(dates) {
  if (!dates?.start_date) return null;
  const time = dates.start_time || "00:00";
  return new Date(`${dates.start_date}T${time}:00`);
}

function extractEvents(body) {
  if (Array.isArray(body?.events)) return body.events;
  if (body?.id && body?.name) return [body];
  if (body?.event?.id && body?.event?.name) return [body.event];
  if (body?.data?.id && body?.data?.name) return [body.data];
  if (body?.payload?.id && body?.payload?.name) return [body.payload];
  return [];
}

export async function POST(req) {
  try {
    const body = await req.json();
    const events = extractEvents(body);

    if (events.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "Event payload not found. Expected event object or events[].",
          receivedKeys: body && typeof body === "object" ? Object.keys(body) : [],
        },
        { status: 400 },
      );
    }

    const saved = [];
    const errors = [];

    for (const payload of events) {
      if (!payload?.id || !payload?.name) {
        errors.push({ id: payload?.id ?? null, error: "Missing id or name" });
        continue;
      }

      try {
        const event = await prisma.event.upsert({
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
          },
          update: {
            name: payload.name,
            bookingUrl: payload.booking_url ?? null,
            facebookEventId: payload.facebook_event_id ?? null,
            startAt: toStartAt(payload.dates),
            description: payload.description?.text ?? null,
            entranceFee: payload.details?.entrance_fee ?? null,
            detailsUrl: payload.details?.url ?? null,
          },
        });

        saved.push({ id: event.id, externalId: event.externalId });
      } catch (err) {
        errors.push({
          id: payload.id ?? null,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

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
