import SearchInput from "@/components/SearchInput/search";
import Filtr from "@/components/Filtr/filtr";
import Collection from "@/components/Collection/collection";
import { cache } from "react";
import { searchEventsByQuery } from "@/lib/search/events";

const getData = cache(async (query) => {
  return searchEventsByQuery(query);
});

export default async function Hledat({ searchParams }) {
  const params = await searchParams;
  const query = typeof params?.query === "string" ? params.query : "";
  const data = await getData(query);

  return (
    <>
      <SearchInput />
      <Filtr />
      <Collection data={data} />
    </>
  );
}
