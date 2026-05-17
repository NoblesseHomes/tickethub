import { NextResponse } from "next/server";
import { searchEventsByQuery } from "@/lib/search/events";

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  try {
    const response = await searchEventsByQuery(searchParams.get("query"));

    return NextResponse.json({
      ok: true,
      data: response,
    });
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
