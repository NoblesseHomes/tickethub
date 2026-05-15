"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { IoSearchOutline } from "react-icons/io5";
import Skeleton from "@mui/material/Skeleton";

export default function SearchInput() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const formatEventDate = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat("cs-CZ", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

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
      <div className="mx-auto w-full max-w-340 px-4 py-4 sm:px-8">
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
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className={
                      index === 0
                        ? "flex gap-3"
                        : "mt-4 flex gap-3 border-t border-border pt-4"
                    }
                  >
                    <Skeleton
                      variant="rectangular"
                      width={56}
                      height={80}
                      sx={{ borderRadius: "8px", flexShrink: 0 }}
                    />
                    <div className="w-full space-y-2">
                      <Skeleton variant="text" width="52%" height={20} />
                      <Skeleton variant="text" width="88%" height={20} />
                      <Skeleton variant="text" width="72%" height={20} />
                      <Skeleton variant="text" width="62%" height={22} />
                    </div>
                  </div>
                ))}
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
                    className="flex gap-3 border-b border-border px-4 py-3 last:border-b-0"
                  >
                    <Image
                      src={item.media.sourceUrl}
                      alt={item.name}
                      width={56}
                      height={80}
                      style={{ height: "100%", width: "auto" }}
                      className="shrink-0 rounded-md object-cover"
                    />
                    <div className="min-w-0">
                      <p className="text-[14.5px] font-semibold text-text">
                        {item.name}
                      </p>
                      {item.description ? (
                        <p className="mt-1 line-clamp-2 text-[13px] text-text-2">
                          {item.description}
                        </p>
                      ) : null}
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13.5px] text-text">
                        <span>
                          {item.place?.city ||
                            item.place?.company ||
                            "Unknown location"}
                        </span>
                        {item.startAt ? (
                          <span className="text-border">•</span>
                        ) : null}
                        {item.startAt ? (
                          <span className="whitespace-nowrap">
                            {formatEventDate(item.startAt)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
