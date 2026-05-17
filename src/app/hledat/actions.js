"use server";

import { searchEventsByQuery } from "@/lib/search/events";

export async function searchEventsAction(query) {
  return searchEventsByQuery(query);
}
