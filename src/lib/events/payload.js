export function toStartAt(dates) {
  if (!dates?.start_date) return null;
  const time = dates.start_time || "00:00";
  return new Date(`${dates.start_date}T${time}:00`);
}

export function extractEvents(body) {
  if (Array.isArray(body?.events)) return body.events;
  if (body?.id && body?.name) return [body];
  if (body?.event?.id && body?.event?.name) return [body.event];
  if (body?.data?.id && body?.data?.name) return [body.data];
  if (body?.payload?.id && body?.payload?.name) return [body.payload];
  return [];
}

function uniqueStrings(values) {
  return [...new Set(values.filter((v) => typeof v === "string" && v.trim() !== ""))];
}

export function extractClassification(payload) {
  const themes = uniqueStrings(
    (payload.classification?.themes || []).map((theme) => theme?.name),
  );
  const genres = uniqueStrings(
    (payload.classification?.themes || []).flatMap((theme) => theme?.genres || []),
  );
  const types = uniqueStrings(payload.classification?.types || []);
  return { themes, genres, types };
}
