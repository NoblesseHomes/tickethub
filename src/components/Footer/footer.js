import Link from "next/link";
import Image from "next/image";

const SOCIALS = [
  { name: "Twitter", href: "#" },
  { name: "Instagram", href: "#" },
  { name: "Facebook", href: "#" },
  { name: "YouTube", href: "#" },
];

const FOOTER_LINKS = [
  { label: "About", href: "#" },
  { label: "Help center", href: "#" },
  { label: "Contact us", href: "#" },
  { label: "Buyer guarantee", href: "#" },
];

const LEGAL_LINKS = [
  { label: "Terms of service", href: "#" },
  { label: "Privacy policy", href: "#" },
  { label: "Refund policy", href: "#" },
  { label: "Cookies", href: "#" },
];

const BOTTOM_LINKS = [
  { label: "FAQ", href: "#" },
  { label: "Accessibility", href: "#" },
];

export default function Footer() {
  return (
    <footer className="mt-12 bg-navy text-brand-soft">
      <div className="mx-auto grid w-full max-w-340 gap-10 px-4 py-11 sm:px-8 lg:grid-cols-[1.6fr_1fr_1fr_1.2fr]">
        <div>
          <Link href="/" className="inline-flex items-center">
            <Image
              src="/logo.svg"
              alt="TicketHub logo"
              width={196}
              height={48}
              className="h-4 w-auto sm:h-6"
            />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-6 text-[#8FA1BC]">
            The trusted marketplace for live events. Every ticket is verified
            and backed by our buyer guarantee.
          </p>
          <div className="mt-4 flex items-center gap-2">
            {SOCIALS.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                aria-label={item.name}
                className="grid h-8 w-8 place-items-center rounded-lg border border-white/15 text-sm text-brand-soft transition hover:border-white/30 hover:bg-white/10 hover:text-white"
              >
                {item.name.slice(0, 1)}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-xs font-semibold tracking-[0.12em] text-white uppercase">
            Links
          </h4>
          <ul className="space-y-2 text-sm">
            {FOOTER_LINKS.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="text-brand-soft transition hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-xs font-semibold tracking-[0.12em] text-white uppercase">
            Legal
          </h4>
          <ul className="space-y-2 text-sm">
            {LEGAL_LINKS.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="text-brand-soft transition hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-xs font-semibold tracking-[0.12em] text-white uppercase">
            Stay in the loop
          </h4>
          <p className="mb-3 text-sm text-[#8FA1BC]">
            Weekly drops, presale alerts, no spam.
          </p>
          <form className="flex gap-2">
            <input
              type="email"
              placeholder="you@email.com"
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-[#7C8DA8] focus:border-white/35"
            />
            <button
              type="submit"
              className="rounded-lg bg-cta px-4 text-sm font-semibold text-white transition hover:bg-cta-hover"
            >
              Join
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-340 flex-wrap items-center justify-between gap-3 px-4 py-4 text-xs text-[#7C8DA8] sm:px-8">
          <div>&copy; 2026 TicketHub, Inc. All rights reserved.</div>
          <div className="flex gap-4">
            {BOTTOM_LINKS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-[#7C8DA8] transition hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
