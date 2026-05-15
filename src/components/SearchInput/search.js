"use client";
import { useState, useEffect } from "react";
import { IoArrowForward, IoSearchOutline } from "react-icons/io5";

export default function SearchInput() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState([]);
  const [error, serError] = useState(null);

  useEffect(() => {
    if (input.length <= 2 || input.trim() === "") return;
    const controller = new AbortController();

    const delayId = setTimeout(async () => {
      try {
        // 1. Правильно зашиваем и кодируем один параметр
        const url = `/api/search?query=${encodeURIComponent(input.trim())}`;

        // 2. Отправляем запрос с сигналом отмены
        const response = await fetch(url, {
          signal: controller.signal,
        });

        // 3. Проверяем статус ответа (fetch не кидает ошибку при 404 или 500)
        if (!response.ok) {
          throw new Error(`Ошибка сервера: ${response.status}`);
        }

        // 4. У fetch нет свойства .data, парсим JSON принудительно
        const { data } = await response.json();

        // 5. Записываем результат в стейт (или выводим в консоль)
        console.log(data);
      } catch (error) {
        // Игнорируем ошибку отмены, обрабатываем только реальные ошибки
        if (error.name !== "AbortError") {
          console.error("Ошибка при поиске:", error);
        }
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
        <div className="flex h-13.5 flex-1 items-center gap-3 rounded-xl border border-border bg-bg px-4 transition focus-within:border-brand focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(4,68,140,0.08)]">
          <IoSearchOutline className="h-6 w-6 text-text-2" />
          <input
            type="text"
            onChange={(e) => setInput(e.target.value)}
            value={input}
            placeholder="Search events, artists, venues…"
            className="h-full flex-1 bg-transparent text-[15.5px] text-text outline-none placeholder:text-text-2"
          />
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
