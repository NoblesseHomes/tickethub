import { prisma } from "@/lib/prisma";

export function getSearchTokens(searchString) {
  if (typeof searchString !== "string") return [];

  return searchString
    .trim()
    .split(/\s+/)
    .filter((token) => token.length > 0);
}

export async function searchEventsByQuery(query) {
  const words = getSearchTokens(query);

  if (words.length === 0) {
    return [];
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

  return prisma.event.findMany({
    where: {
      OR: whereConditions,
    },
    include: {
      place: true,
      media: true,
    },
  });
}
