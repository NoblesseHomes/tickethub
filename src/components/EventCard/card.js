import Image from "next/image";
import Link from "next/link";
import {
  IoCalendarOutline,
  IoLocationOutline,
  IoChevronForward,
} from "react-icons/io5";

const R2_BASE_URL = "https://pub-3e3f54c47f534f22b4b204f86b9ab4e5.r2.dev/";

function formatEventDate(value) {
  if (!value) return "Datum bude upřesněno";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Datum bude upřesněno";

  return new Intl.DateTimeFormat("cs-CZ", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function EventCard({ event }) {
  const title = event?.name || "Akce bez názvu";
  const venue = event?.place?.company || event?.place?.city || "Neznámé místo";
  const dateLabel = formatEventDate(event?.startAt);
  const category = event?.types?.[0] || event?.themes?.[0] || "Akce";
  const city = event?.place?.city || "Mesto";
  const detailsUrl = event?.detailsUrl || event?.bookingUrl || "#";
  const price = event?.entranceFee || "Cena bude upřesněna";
  const imageUrl = event?.media?.s3Key;

  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand-soft hover:shadow-lg">
      <div className="relative aspect-5/6 shrink-0 overflow-hidden bg-surface sm:aspect-3/4">
        {/* <span className="absolute left-2.5 top-2.5 z-10 rounded-md border border-white/35 bg-black/72 px-2 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white shadow-[0_3px_10px_rgba(0,0,0,0.55)] backdrop-blur-[2px] [text-shadow:0_1px_2px_rgba(0,0,0,0.8)] sm:left-3 sm:top-3 sm:text-[10.5px]">
          {category}
        </span>
        <span className="absolute right-2.5 bottom-2.5 z-10 rounded-md border border-white/35 bg-black/72 px-2 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white shadow-[0_3px_10px_rgba(0,0,0,0.55)] backdrop-blur-[2px] [text-shadow:0_1px_2px_rgba(0,0,0,0.8)] sm:right-3 sm:bottom-3 sm:text-[10.5px]">
          {city}
        </span> */}
        {imageUrl ? (
          <Image
            src={R2_BASE_URL + imageUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, (max-width: 1536px) 25vw, 20vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-end bg-linear-to-br from-navy via-brand to-brand-hover p-3"></div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-2.5 sm:gap-2 sm:p-3.5">
        <h3 className="line-clamp-2 text-[14px] font-semibold leading-tight text-text sm:text-[15px]">
          {title}
        </h3>

        <div className="flex items-center gap-1.5 text-[12px] font-medium text-text sm:gap-2 sm:text-[13px]">
          <IoCalendarOutline
            className="h-3 w-3 shrink-0 text-brand sm:h-3.25 sm:w-3.25"
            aria-hidden="true"
          />
          <span className="line-clamp-1">{dateLabel}</span>
        </div>

        <p className="flex items-center gap-1.5 text-[11.5px] text-text-2 sm:text-[12.5px]">
          <IoLocationOutline className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span className="line-clamp-1">
            {venue}, {city}
          </span>
        </p>

        <div className="mt-auto flex items-end justify-between gap-2 border-t border-dashed border-border pt-2.5 sm:pt-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.04em] text-text-2 sm:text-[11px]">
              Od
            </p>
            <p className="text-[15px] font-bold leading-none text-text sm:text-[19px]">
              {price}
            </p>
          </div>

          <Link
            href={detailsUrl}
            className="inline-flex items-center gap-1 rounded-lg bg-brand px-2.5 py-1.5 text-[11.5px] font-semibold text-white transition hover:bg-brand-hover sm:gap-1.5 sm:px-3 sm:py-2 sm:text-[12.5px]"
            target="_blank"
            rel="noopener"
          >
            Detail
            <IoChevronForward
              className="h-2.5 w-2.5 sm:h-2.75 sm:w-2.75"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}
