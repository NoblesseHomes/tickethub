"use client";
import { useState, useEffect } from "react";
import { IoArrowForward, IoSearchOutline } from "react-icons/io5";
import Skeleton from "@mui/material/Skeleton";

export default function SearchInput() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    setHasSearched(false);

    if (value.trim().length <= 2) {
      setResult([]);
      setError(null);
    }
  };

  useEffect(() => {
    if (input.length <= 2 || input.trim() === "") {
      return;
    }
    const controller = new AbortController();

    const delayId = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError(null);

        const url = `/api/search?query=${encodeURIComponent(input.trim())}`;

        const response = await fetch(url, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Ошибка сервера: ${response.status}`);
        }

        const { data } = await response.json();

        console.log(data);

        setResult(Array.isArray(data) ? data : []);
        setHasSearched(true);
      } catch (error) {
        if (error.name !== "AbortError") {
          setError("Search failed. Please try again.");
          setResult([]);
          setHasSearched(true);
        }
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(delayId);
      controller.abort();
    };
  }, [input]);

  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto flex w-full max-w-340 items-center gap-3 px-4 py-4 sm:px-8">
        <div className="relative flex-1">
          <div className="flex h-13.5 items-center gap-3 rounded-xl border border-border bg-bg px-4 transition focus-within:border-brand focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(4,68,140,0.08)]">
            <IoSearchOutline className="h-6 w-6 text-text-2" />
            <input
              type="text"
              onChange={handleInputChange}
              value={input}
              placeholder="Search events, artists, venues…"
              className="h-full flex-1 bg-transparent text-[15.5px] text-text outline-none placeholder:text-text-2"
            />
          </div>

          <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30">
            {input.trim().length <= 2 ? null : isLoading ? (
              <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
                <div className="space-y-3">
                  <Skeleton variant="text" width="40%" height={20} />
                  <Skeleton variant="text" width="92%" height={20} />
                  <Skeleton variant="text" width="78%" height={20} />
                </div>
                <div className="mt-4 space-y-3 border-t border-border pt-4">
                  <Skeleton variant="text" width="52%" height={20} />
                  <Skeleton variant="text" width="88%" height={20} />
                  <Skeleton variant="text" width="72%" height={20} />
                </div>
                <div className="mt-4 space-y-3 border-t border-border pt-4">
                  <Skeleton variant="text" width="52%" height={20} />
                  <Skeleton variant="text" width="88%" height={20} />
                  <Skeleton variant="text" width="72%" height={20} />
                </div>
                <div className="mt-4 space-y-3 border-t border-border pt-4">
                  <Skeleton variant="text" width="52%" height={20} />
                  <Skeleton variant="text" width="88%" height={20} />
                  <Skeleton variant="text" width="72%" height={20} />
                </div>
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-[14px] text-red-700 shadow-sm">
                {error}
              </div>
            ) : !hasSearched ? null : result.length === 0 ? (
              <div className="rounded-xl border border-border bg-white p-4 text-[14px] text-text-2 shadow-sm">
                Nothing found for &quot;{input.trim()}&quot;.
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto rounded-xl border border-border bg-white shadow-sm">
                {result.map((item) => (
                  <div
                    key={item.id}
                    className="border-b border-border px-4 py-3 last:border-b-0"
                  >
                    <p className="text-[14.5px] font-semibold text-text">
                      {item.name}
                    </p>
                    {item.description ? (
                      <p className="mt-1 line-clamp-2 text-[13px] text-text-2">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          className="inline-flex h-13.5 items-center gap-2 rounded-xl bg-cta px-7 text-[14.5px] font-semibold text-white transition hover:bg-cta-hover"
        >
          Search
          <IoArrowForward className="h-3.75 w-3.75" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
