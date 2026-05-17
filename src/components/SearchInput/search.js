"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { IoSearchOutline, IoCloseSharp } from "react-icons/io5";
import Skeleton from "@mui/material/Skeleton";

const MIN_QUERY_LENGTH = 3;
const SEARCH_DEBOUNCE_MS = 300;

export default function SearchInput() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [inputIsFocused, setInputIsFocused] = useState(false);

  const trimmedInput = input.trim();
  const canSearch = trimmedInput.length >= MIN_QUERY_LENGTH;

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

    if (value.trim().length < MIN_QUERY_LENGTH) {
      setResult([]);
      setError(null);
    }
  };

  const handleClearInput = () => {
    setInput("");
    setResult([]);
    setError(null);
    setHasSearched(false);
  };

  useEffect(() => {
    if (!canSearch) {
      return;
    }

    const controller = new AbortController();

    const delayId = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError(null);

        const url = `/api/search?query=${encodeURIComponent(trimmedInput)}`;

        const response = await fetch(url, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Chyba serveru: ${response.status}`);
        }

        const { data } = await response.json();

        setResult(Array.isArray(data) ? data : []);
        setHasSearched(true);
      } catch (error) {
        if (error.name !== "AbortError") {
          setError("Vyhledávání se nezdařilo. Zkuste to prosím znovu.");
          setResult([]);
          setHasSearched(true);
        }
      } finally {
        setIsLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(delayId);
      controller.abort();
    };
  }, [canSearch, trimmedInput]);

  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto w-full max-w-340 px-4 py-3 sm:px-8 sm:py-4">
        <div className="relative flex-1">
          <div className="flex h-13.5 items-center gap-3 rounded-xl border border-border bg-bg px-4 transition focus-within:border-brand focus-within:bg-white">
            <IoSearchOutline className="h-6 w-6 text-text-2" />
            <input
              type="text"
              onChange={handleInputChange}
              onFocus={() => setInputIsFocused(true)}
              onBlur={() => setInputIsFocused(false)}
              value={input}
              placeholder="Hledejte akce, umělce, místa…"
              className="h-full flex-1 bg-transparent text-[15px] text-text outline-none placeholder:text-text-2 sm:text-[15.5px]"
            />
            {input && (
              <button
                type="button"
                onClick={handleClearInput}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-text-2 transition-all duration-200 hover:bg-text-2/10 hover:text-text active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand cursor-pointer"
                aria-label="Vymazat vstup"
              >
                <IoCloseSharp className="h-6 w-6" />
              </button>
            )}
          </div>

          {inputIsFocused && (
            <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30">
              {!canSearch ? null : isLoading ? (
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
                        width={48}
                        height={64}
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
                  Pro &quot;{trimmedInput}&quot; nebylo nic nalezeno.
                </div>
              ) : (
                <div className="max-h-[70vh] overflow-y-auto rounded-xl border border-border bg-white shadow-sm sm:max-h-80">
                  {result.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 border-b border-border px-4 py-3 last:border-b-0"
                    >
                      {item.media?.sourceUrl ? (
                        <Image
                          src={item.media.sourceUrl}
                          alt={item.name || "Obrázek akce"}
                          width={56}
                          height={80}
                          className="h-16 w-12 shrink-0 rounded-md object-cover sm:h-20 sm:w-14"
                        />
                      ) : (
                        <div className="h-16 w-12 shrink-0 rounded-md bg-surface sm:h-20 sm:w-14" />
                      )}
                      <div className="min-w-0">
                        <p className="text-[14px] font-semibold text-text sm:text-[14.5px]">
                          {item.name || "Akce bez názvu"}
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
                              "Neznámé místo"}
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
          )}
        </div>
      </div>
    </section>
  );
}
