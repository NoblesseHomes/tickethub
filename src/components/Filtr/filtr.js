"use client";

import { useState } from "react";

const filterData = {
  city: ["Prague", "Brno", "Ostrava", "Plzen"],
  type: ["Concert", "Festival", "Theater", "Sport"],
  genre: ["Rock", "Pop", "Electronic", "Hip-Hop", "Jazz"],
};

export default function Filtr() {
  const [selected, setSelected] = useState({
    city: null,
    type: null,
    genre: null,
  });

  const handleClear = () => {
    setSelected({
      city: null,
      type: null,
      genre: null,
    });
  };

  return (
    <section className="border-b border-border bg-surface">
      <form
        action="/listings"
        method="get"
        className="mx-auto flex w-full max-w-[1360px] flex-wrap items-center gap-2 px-4 py-3 sm:px-8"
      >
        <select
          name="city"
          value={selected.city ?? ""}
          onChange={(event) =>
            setSelected((prev) => ({ ...prev, city: event.target.value || null }))
          }
          className="h-10 w-full rounded-[10px] border border-border bg-bg px-3 text-[13.5px] font-medium text-text outline-none transition hover:border-[#B7CBE2] focus:border-brand sm:w-[220px]"
        >
          <option value="">City</option>
          {filterData.city.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
        <select
          name="type"
          value={selected.type ?? ""}
          onChange={(event) =>
            setSelected((prev) => ({ ...prev, type: event.target.value || null }))
          }
          className="h-10 w-full rounded-[10px] border border-border bg-bg px-3 text-[13.5px] font-medium text-text outline-none transition hover:border-[#B7CBE2] focus:border-brand sm:w-[220px]"
        >
          <option value="">Type</option>
          {filterData.type.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <select
          name="genre"
          value={selected.genre ?? ""}
          onChange={(event) =>
            setSelected((prev) => ({ ...prev, genre: event.target.value || null }))
          }
          className="h-10 w-full rounded-[10px] border border-border bg-bg px-3 text-[13.5px] font-medium text-text outline-none transition hover:border-[#B7CBE2] focus:border-brand sm:w-[220px]"
        >
          <option value="">Genre</option>
          {filterData.genre.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="ml-1 text-[13px] font-medium text-text-2 transition hover:text-brand"
          onClick={handleClear}
        >
          Clear
        </button>
        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-[10px] bg-cta px-5 text-[13.5px] font-semibold text-white transition hover:bg-cta-hover"
        >
          Search
        </button>
      </form>
    </section>
  );
}
