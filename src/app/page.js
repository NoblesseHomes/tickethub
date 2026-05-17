import Filtr from "@/components/Filtr/filtr";
import SearchInput from "@/components/SearchInput/search";
import { cache } from "react";

import { prisma } from "@/lib/prisma";

import Collection from "@/components/Collection/collection";
import Link from "next/link";

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

  // const uniqLocation = [
  //   ...new Set(data.map((item) => item?.place?.city).filter(Boolean)),
  // ];
  // const uniqTypes = [
  //   ...new Set(data.flatMap((item) => item?.types ?? []).filter(Boolean)),
  // ];
  // const uniqThemes = [
  //   ...new Set(data.flatMap((item) => item?.themes ?? []).filter(Boolean)),
  // ];

  // const propData = {
  //   location: uniqLocation,
  //   types: uniqTypes,
  //   theme: uniqThemes,
  // };

  return (
    <main>
      <SearchInput />
      <Filtr />
      <Collection data={data} />
      <div className="mx-auto flex w-full max-w-340 justify-center px-4 sm:px-8">
        <Link
          href="/hledat/strana-2"
          className="inline-flex rounded-lg bg-brand px-4 py-2 text-surface transition hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          aria-label="Zobrazit další události"
        >
          Zobrazit další
        </Link>
      </div>
    </main>
  );
}
