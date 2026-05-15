import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getSearchTokens(searchString) {
  if (typeof searchString !== "string") return [];

  return searchString
    .trim()
    .split(/\s+/)
    .filter((token) => token.length > 0);
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const words = getSearchTokens(searchParams.get("query"));

  // Единая проверка: если query пустой/невалидный, не делаем запрос к БД
  if (words.length === 0) {
    return NextResponse.json({
      ok: true,
      data: [],
    });
  }

  const whereConditions = words.map((word) => ({
    OR: [
      { name: { contains: word, mode: "insensitive" } },
      { description: { contains: word, mode: "insensitive" } },
      { place: { is: { street: { contains: word, mode: "insensitive" } } } },
      { place: { is: { city: { contains: word, mode: "insensitive" } } } },
      { place: { is: { company: { contains: word, mode: "insensitive" } } } },
    ],
  }));

  try {
    const response = await prisma.event.findMany({
      where: {
        OR: whereConditions,
      },
      include: {
        place: true,
        media: true,
      },
    });

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
