import EventCard from "../EventCard/card";

export default function Collection({ data }) {
  return (
    <section aria-labelledby="events-list-title" className="py-6 sm:py-8 ">
      <div className="mx-auto w-full max-w-340 px-4 sm:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
          Najděte akce, koncerty a zážitky ve svém městě
        </h1>
        <h2 id="events-list-title" className="sr-only">
          Seznam akcí
        </h2>

        <div
          className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 sm:mt-5"
          aria-live="polite"
        >
          {data.slice(0, 20).map((item) => (
            <EventCard key={item.id} event={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
