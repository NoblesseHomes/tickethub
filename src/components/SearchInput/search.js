import { IoArrowForward, IoSearchOutline } from "react-icons/io5";

export default function SearchInput() {
  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto flex w-full max-w-340 items-center gap-3 px-4 py-4 sm:px-8">
        <div className="flex h-13.5 flex-1 items-center gap-3 rounded-xl border border-border bg-bg px-4 transition focus-within:border-brand focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(4,68,140,0.08)]">
          <IoSearchOutline className="h-6 w-6 text-text-2" />
          <input
            type="text"
            placeholder="Search events, artists, venues…"
            className="h-full flex-1 bg-transparent text-[15.5px] text-text outline-none placeholder:text-text-2"
          />
        </div>

        <button
          type="button"
          className="inline-flex h-13.5 items-center gap-2 rounded-xl bg-cta px-7 text-[14.5px] font-semibold text-white transition hover:bg-cta-hover"
        >
          Search
          <IoArrowForward className="h-[15px] w-[15px]" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
