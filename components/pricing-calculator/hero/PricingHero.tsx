import Link from "next/link";
import { ArrowRightIcon, CalculatorIcon, ChevronRightIcon, MagnifyingGlassIcon, SignalIcon } from "@heroicons/react/20/solid";
import * as mk from "@/components/ui/marketing/styles";
import { ANNUAL_DISCOUNT, CLASSIFY_PLANS, FREE_TRACKED_PAIRS, TRACKER_TIERS, formatPrice } from "../lib/pricing";

const PRODUCTS = [
  {
    href: "#tariffs",
    name: "Tariff Calculator",
    summary: "Every duty on an import, unlimited, no account",
    price: null,
    Icon: CalculatorIcon,
    tint: "bg-sky-100 text-sky-700",
  },
  {
    href: "#tariffs",
    name: "Tariff Tracker",
    summary: `Alerts, audits and savings · free for ${FREE_TRACKED_PAIRS} products`,
    price: formatPrice(TRACKER_TIERS[0].price),
    Icon: SignalIcon,
    tint: "bg-teal-100 text-teal-700",
  },
  {
    href: "#classification",
    name: "Classify",
    summary: "HTS classifications you can defend",
    price: formatPrice(CLASSIFY_PLANS.starter.price),
    Icon: MagnifyingGlassIcon,
    tint: "bg-amber-100 text-amber-700",
  },
];

// The top of /pricing-calculator. Server-rendered so crawlers see the copy and the prices.
export const PricingHero = () => (
  <header className={`${mk.bandTint} relative overflow-hidden`}>
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(48rem_24rem_at_85%_-10%,rgba(45,212,191,0.18),transparent)]"
    />
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
          The Tariff Calculator is free and unlimited. When you want to track your own products, catch tariff changes, audit your entries and find savings, you can give Tariff Tracker a try.
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

      <nav aria-label="Products" className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
        <p className="border-b border-slate-100 px-6 py-4 text-sm font-bold uppercase tracking-wider text-slate-500">
          Three tools, one platform
        </p>
        <ul className="divide-y divide-slate-100">
          {PRODUCTS.map(({ href, name, summary, price, Icon, tint }) => (
            <li key={name}>
              <Link
                href={href}
                className="group flex items-center gap-4 px-6 py-5 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500/60"
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tint}`}>
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-slate-900">{name}</span>
                  <span className="mt-0.5 block text-sm text-slate-500">{summary}</span>
                </span>
                {price === null ? (
                  <span className="text-xl font-bold text-emerald-600">Free</span>
                ) : (
                  <span className="text-right">
                    <span className="block text-xs text-slate-500">from</span>
                    <span className="text-xl font-bold tabular-nums text-slate-900">{price}</span>
                    <span className="text-sm text-slate-500">/mo</span>
                  </span>
                )}
                <ChevronRightIcon className="h-5 w-5 shrink-0 text-slate-300 transition-colors group-hover:text-teal-600" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
        <p className="flex items-center gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4 text-sm text-slate-600">
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
            Save {ANNUAL_DISCOUNT * 100}%
          </span>
          on every paid plan with annual billing
        </p>
      </nav>
    </div>
  </header>
);
