import Filtr from "@/components/Filtr/filtr";
import SearchInput from "@/components/SearchInput/search";
import { cache } from "react";

import { prisma } from "@/lib/prisma";

const getData = cache(async () => {
  try {
    const response = await prisma.event.findMany({
      include: {
        place: true,
      },
    });

    return response;
  } catch (error) {
    return [];
  }
});

export default async function Home() {
  const data = await getData();

  const uniqLocation = [
    ...new Set(data.map((item) => item?.place?.city).filter(Boolean)),
  ];
  const uniqTypes = [
    ...new Set(data.flatMap((item) => item?.types ?? []).filter(Boolean)),
  ];
  const uniqThemes = [
    ...new Set(data.flatMap((item) => item?.themes ?? []).filter(Boolean)),
  ];

  const propData = {
    location: uniqLocation,
    types: uniqTypes,
    theme: uniqThemes,
  };

  return (
    <main>
      <h1 className="sr-only">TicketHub - vyhledávání a filtrování akcí</h1>
      <SearchInput />
      <Filtr data={propData} />
    </main>
  );
}
