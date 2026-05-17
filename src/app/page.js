import Filtr from "@/components/Filtr/filtr";
import SearchInput from "@/components/SearchInput/search";
import { cache } from "react";

import { prisma } from "@/lib/prisma";

import EventCard from "@/components/EventCard/card";

const getData = cache(async () => {
  try {
    const response = await prisma.event.findMany({
      include: {
        place: true,
        media: true,
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

      <section aria-labelledby="events-list-title" className="py-6 sm:py-8 ">
        <div className="mx-auto w-full max-w-340 px-4 sm:px-8">
          <h2 id="events-list-title" className="sr-only">
            Seznam akcí
          </h2>

          <div
            className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
            aria-live="polite"
          >
            {data.map((item) => (
              <EventCard key={item.id} event={item} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
