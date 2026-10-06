import Link from "next/link";
import { ArrowRightIcon, CheckIcon } from "@heroicons/react/20/solid";
// Straight from the price list: the pricing feature's index also pulls in its client components
import { TARIFF_CALCULATOR_PRICE, formatPrice } from "@/components/pricing-calculator/lib/pricing";
import * as ui from "@/components/ui/styles";

const PROMISES = [
  "Free to start, no sign-up: every tariff on your import, line by line",
  "Published prices, monthly plans, no contract",
  "No demo, no sales call, no freight account",
  "Start in about a minute",
];

// The comparison pages' call to action. Its pitch is the thing most competitors can't say:
// you can see the price and start right now.
export function SelfServeCta({ title = "Try HTS Hero now. No demo required." }: { title?: string }) {
  return (
    <section className={ui.card}>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="flex flex-col gap-3 p-6 sm:p-8">
          <span className={ui.kicker}>Start free</span>
          <h2 className={ui.sectionTitle}>{title}</h2>
          <p className={`${ui.body} max-w-prose`}>
            Enter an HTS code and a country of origin and see the full US duty: the base rate, every Chapter 99 tariff
            and the fees. When you need unlimited calculations, it&apos;s {formatPrice(TARIFF_CALCULATOR_PRICE)} a month.
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Link href="/duty-calculator" className={ui.button({ variant: "primary", size: "lg" })}>
              Calculate a duty free
              <ArrowRightIcon className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/pricing-calculator" className={ui.button({ size: "lg" })}>
              See pricing
            </Link>
          </div>
        </div>
        <div className="flex flex-col justify-center border-t border-base-300 bg-base-200 p-6 sm:p-8 lg:border-l lg:border-t-0">
          <ul className="flex flex-col gap-3">
            {PROMISES.map((promise) => (
              <li key={promise} className="flex items-start gap-2.5 text-base text-base-content">
                <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-success" aria-hidden />
                {promise}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
