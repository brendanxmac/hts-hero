import Link from "next/link";
import { ArrowRightIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import {
  ANNUAL_DISCOUNT,
  CLASSIFY_PLANS,
  TARIFF_CALCULATOR_PRICE,
  TRACKER_TIERS,
  formatPrice,
} from "../lib/pricing";

const PRODUCTS = [
  {
    href: "#tariffs",
    name: "Tariff Calculator",
    summary: "Every duty on an import, line by line",
    price: formatPrice(TARIFF_CALCULATOR_PRICE),
    from: false,
  },
  {
    href: "#tariffs",
    name: "Tariff Tracker",
    summary: "Your whole catalog watched, calculator included",
    price: formatPrice(TRACKER_TIERS[0].price),
    from: true,
  },
  {
    href: "#classification",
    name: "Classify",
    summary: "HTS classifications you can defend",
    price: formatPrice(CLASSIFY_PLANS.starter.price),
    from: true,
  },
];

// The top of /pricing-calculator. Server-rendered so crawlers see the copy and the prices.
export const PricingHero = () => (
  <header
    className={`${ui.container} grid gap-10 pt-10 pb-12 md:pt-14 md:pb-16 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-center lg:gap-12 xl:gap-20`}
  >
    <div className="min-w-0">
      <h1>
        <span className={`${ui.kicker} block`}>Pricing</span>
        <span className={`${ui.display} mt-3 block max-w-3xl leading-tight`}>
          Pay for what your imports need.{" "}
          <span className="text-primary">Nothing more.</span>
        </span>
      </h1>
      <p className={`${ui.lead} mt-5 max-w-2xl`}>
        Calculate the duty on any import, track tariff changes across your
        catalog, and back every HTS code with a classification you can defend.
        Pick the tools you use and see your price before you sign up.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <a href="#estimate" className={ui.button({ variant: "primary", size: "lg" })}>
          Estimate your price
          <ArrowRightIcon className="h-4 w-4" aria-hidden />
        </a>
        <a href="#tariffs" className={ui.button({ size: "lg" })}>
          Compare plans
        </a>
      </div>
    </div>

    <nav aria-label="Products" className={ui.card}>
      <div className={ui.cardHeader}>
        <h2 className={ui.cardTitle}>Three tools, one platform</h2>
      </div>
      <ul className="divide-y divide-base-300">
        {PRODUCTS.map((product) => (
          <li key={product.name}>
            <Link
              href={product.href}
              className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-base-200/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-base-content">{product.name}</span>
                <span className={`${ui.caption} block mt-0.5`}>{product.summary}</span>
              </span>
              <span className="text-right">
                {product.from && <span className={`${ui.caption} block`}>from</span>}
                <span className="text-lg font-semibold tabular-nums text-base-content">{product.price}</span>
                <span className={ui.caption}>/mo</span>
              </span>
              <ChevronRightIcon
                className="h-5 w-5 shrink-0 text-base-content/60 transition-colors group-hover:text-primary"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
      <p className={`${ui.cardFooter} ${ui.caption}`}>
        Save {ANNUAL_DISCOUNT * 100}% on every plan with annual billing.
      </p>
    </nav>
  </header>
);
