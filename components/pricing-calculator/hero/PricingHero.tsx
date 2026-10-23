import Link from "next/link";
import { ArrowRightIcon, CalculatorIcon, ChevronRightIcon, MagnifyingGlassIcon, SignalIcon } from "@heroicons/react/20/solid";
import * as mk from "@/components/ui/marketing/styles";
import { AUTO_AUDITING, FREE_FOREVER_LINE, SAVINGS_DETECTION } from "@/components/ui/marketing/comingSoon";
import { TRACKER_ANNUAL_ENABLED } from "@/libs/tariff-tracker/features";
import { ANNUAL_DISCOUNT, CLASSIFY_PLANS, LOWEST_PER_IMPORT, REVERSE_TRIAL, TRACKER_TIERS, formatPrice } from "../lib/pricing";

const PRODUCTS = [
  {
    href: "#tariffs",
    name: "Tariff Calculator",
    summary: "Every duty on an import, unlimited, no account",
    price: null,
    perImport: null,
    Icon: CalculatorIcon,
    tint: "bg-sky-100 text-primary",
  },
  {
    href: "#tariffs",
    name: "Tariff Tracker",
    summary: `Alerts and impact checks on your imports · free for ${REVERSE_TRIAL.days} days`,
    price: formatPrice(TRACKER_TIERS[0].price),
    perImport: `as low as ${formatPrice(LOWEST_PER_IMPORT)} per import`,
    Icon: SignalIcon,
    tint: "bg-primary/15 text-primary",
  },
  {
    href: "#classification",
    name: "Classify",
    summary: "HTS classifications you can defend",
    price: formatPrice(CLASSIFY_PLANS.starter.price),
    perImport: null,
    Icon: MagnifyingGlassIcon,
    tint: "bg-amber-100 text-warning",
  },
];

// The top of /pricing-calculator. Server-rendered so crawlers see the copy and the prices.
export const PricingHero = () => (
  <header className={`${mk.bandTint} relative overflow-hidden`}>
    <div
      className={`${mk.container} relative grid grid-cols-1 gap-12 py-16 sm:py-24 lg:grid-cols-[minmax(0,1fr)_28rem] lg:items-center lg:gap-16`}
    >
      <div className="min-w-0">
        <h1>
          <span className={`${mk.eyebrow} block`}>Pricing</span>
          <span className={`${mk.display} mt-4 block max-w-3xl`}>
            Look up tariffs free. <span className={mk.accent}>Pay to protect your margin.</span>
          </span>
        </h1>
        <p className={`${mk.lead} mt-6 max-w-2xl`}>
          The Tariff Calculator is free and unlimited. When you want to track every tariff on your own imports, get alerted when a change hits one, and run impact checks to see exactly how each new tariff affects them, try the Tariff Tracker free for {REVERSE_TRIAL.days} days: everything, on up to {REVERSE_TRIAL.imports} imports, with no credit card. {FREE_FOREVER_LINE}
        </p>
        <p className={`${mk.body} mt-4 max-w-2xl`}>
          {SAVINGS_DETECTION.name} and {AUTO_AUDITING.name.toLowerCase()}, included in the trial and every Tracker plan at no extra cost.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <a href="#estimate" className={`${mk.buttonPrimary} h-14 px-8 text-lg`}>
            Estimate your price
            <ArrowRightIcon className="h-5 w-5" aria-hidden />
          </a>
          <a href="#tariffs" className={`${mk.buttonSecondary} h-14 px-8 text-lg`}>
            Compare plans
          </a>
        </div>
      </div>

      <nav aria-label="Products" className="overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-2xl shadow-black/10">
        <p className="border-b border-base-300 px-6 py-4 text-sm font-bold uppercase tracking-wider text-base-content/60">
          Three tools, one platform
        </p>
        <ul className="divide-y divide-base-300">
          {PRODUCTS.map(({ href, name, summary, price, perImport, Icon, tint }) => (
            <li key={name}>
              <Link
                href={href}
                className="group flex items-center gap-4 px-6 py-5 transition-colors hover:bg-tt-soft focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/60"
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tint}`}>
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-base-content">{name}</span>
                  <span className="mt-0.5 block text-sm text-base-content/60">{summary}</span>
                </span>
                {price === null ? (
                  <span className="text-xl font-bold text-success">Free</span>
                ) : (
                  <span className="text-right">
                    <span className="block text-xs text-base-content/60">from</span>
                    <span className="text-xl font-bold tabular-nums text-base-content">{price}</span>
                    <span className="text-sm text-base-content/60">/mo</span>
                    {perImport && <span className="block whitespace-nowrap text-xs text-base-content/60">{perImport}</span>}
                  </span>
                )}
                <ChevronRightIcon className="h-5 w-5 shrink-0 text-base-content/70 transition-colors group-hover:text-primary" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
        <p className="flex items-center gap-2 border-t border-base-300 bg-tt-soft px-6 py-4 text-sm text-base-content/70">
          <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-bold text-success ring-1 ring-success/30">
            Save {ANNUAL_DISCOUNT * 100}%
          </span>
          {TRACKER_ANNUAL_ENABLED ? "on every paid plan with annual billing" : "on Classify with annual billing"}
        </p>
      </nav>
    </div>
  </header>
);
