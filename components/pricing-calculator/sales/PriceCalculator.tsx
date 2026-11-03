"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRightIcon, MinusIcon, PlusIcon } from "@heroicons/react/20/solid";
import { EntryCta } from "@/components/onboarding/EntryCta";
import { DarkBillingSwitch, ProductsSlider } from "@/components/ui/marketing/PlanPricing";
import * as cta from "@/components/ui/marketing/cta";
import * as mk from "@/components/ui/marketing/styles";
import { bookCallHref } from "@/libs/book-call";
import { ALERT_TIERS, Billing, CLASSIFY_LICENSE_PRICE, CLASSIFY_PLANS, formatPrice, priceQuote, QuoteClassify, QuoteOffer, REVERSE_TRIAL } from "../lib/pricing";
import { MAIN_CTA } from "./copy";

// See your price: pick a tariff offer, how many products and a classification option, and the total
// runs to it. The end of the page, so the button under the total is its last ask. Dark in both modes.

const LARGEST = ALERT_TIERS[ALERT_TIERS.length - 1].maxPairs;
const QUOTE_HREF = bookCallHref({ source: "pricing", campaign: "large-catalog", context: `Importer with more than ${LARGEST} products, from the pricing calculator (htshero.com/pricing-calculator)` });

// A big number that runs to its new value
const useRunningNumber = (to: number) => {
  const [value, setValue] = useState(to);
  const from = useRef(to);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      from.current = to;
      setValue(to);
      return;
    }
    const start = performance.now();
    const begin = from.current;
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / 450);
      const next = begin + (to - begin) * (1 - Math.pow(1 - t, 3));
      from.current = next;
      setValue(Math.round(next));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return value;
};

// One choice of several, as tiles that light up
const Tiles = <T extends string>({ label, options, value, onChange }: { label: string; options: { id: T; name: string; note: string }[]; value: T; onChange: (id: T) => void }) => (
  <div role="radiogroup" aria-label={label} className={`grid grid-cols-2 gap-2.5 sm:grid-cols-3 ${options.length > 3 ? "xl:grid-cols-5" : ""}`}>
    {options.map((o) => {
      const on = o.id === value;
      return (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={on}
          onClick={() => onChange(o.id)}
          className={`flex flex-col gap-0.5 rounded-2xl p-4 text-left ring-1 transition-all ${on ? "bg-primary/20 ring-primary shadow-[0_0_40px_-12px] shadow-primary" : "bg-base-content/[0.04] ring-base-content/15 hover:ring-primary/50"}`}
        >
          <span className="font-semibold text-base-content [font-family:var(--font-tracker-display)]">{o.name}</span>
          <span className="text-xs text-base-content/60">{o.note}</span>
        </button>
      );
    })}
  </div>
);

const Step = ({ n, title, children }: { n: number; title: string; children: React.ReactNode }) => (
  <div>
    <h3 className="flex items-center gap-3 text-lg font-semibold text-base-content [font-family:var(--font-tracker-display)]">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-content" aria-hidden>
        {n}
      </span>
      {title}
    </h3>
    <div className="mt-4">{children}</div>
  </div>
);

export const PriceCalculator = () => {
  const [offer, setOffer] = useState<QuoteOffer>("alerts");
  const [products, setProducts] = useState(10);
  const [classify, setClassify] = useState<QuoteClassify>("none");
  const [seats, setSeats] = useState(3);
  const [billing, setBilling] = useState<Billing>("annual");

  const quote = priceQuote({ offer, products, classify, seats }, billing);
  const total = useRunningNumber(quote.monthly);
  const free = !quote.lines.length;
  const onlyClassify = offer === "none" && !free;
  const yearly = quote.monthly * 12;

  return (
    <section id="calculator" className={`relative isolate overflow-hidden ${mk.bandDark} ${mk.band} scroll-mt-16`} aria-labelledby="calculator-title">
      <div className="absolute -left-40 top-20 -z-10 h-[32rem] w-[44rem] rounded-full bg-primary/15 blur-[120px]" aria-hidden />
      <div className="absolute -right-32 bottom-0 -z-10 h-[30rem] w-[40rem] rounded-full bg-success/10 blur-[120px]" aria-hidden />
      <div className={mk.container}>
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="calculator-title" className={mk.h2Dark}>
            See Your Price. <span className="text-primary">Then Try It Free.</span>
          </h2>
          <p className={`${mk.leadDark} mt-5`}>No sign-up or consultation needed to see the number.</p>
        </div>

        <div className="mt-14 grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div className="flex flex-col gap-9">
            <Step n={1} title="Tariff Offer">
              <Tiles<QuoteOffer>
                label="Tariff offer"
                value={offer}
                onChange={setOffer}
                options={[
                  { id: "none", name: "Free", note: "Calculator and tracking" },
                  { id: "alerts", name: "Duty Guard Essentials", note: "Know when tariffs hit" },
                  { id: "audits", name: "Duty Guard Pro", note: "Alerts, audits, savings" },
                ]}
              />
            </Step>

            {offer !== "none" && (
              <Step n={2} title="Your Products">
                <ProductsSlider plans={ALERT_TIERS} products={products} onChange={setProducts} />
              </Step>
            )}

            <Step n={offer === "none" ? 2 : 3} title="Classification Assistant">
              <Tiles<QuoteClassify>
                label="Classification Assistant"
                value={classify}
                onChange={setClassify}
                options={[
                  { id: "none", name: "None", note: "Not right now" },
                  { id: "starter", name: "Starter", note: "10 a month" },
                  { id: "pro", name: "Pro", note: "Up to 100 a month" },
                  { id: "licenses", name: "Licenses", note: `Pro, ${formatPrice(CLASSIFY_LICENSE_PRICE)} per person` },
                  { id: "team", name: "Team", note: "Shared workspace" },
                ]}
              />
              {classify === "licenses" && (
                <div className="mt-4 inline-flex items-center gap-4 rounded-full bg-base-content/10 px-3 py-2">
                  <button type="button" aria-label="One person fewer" disabled={seats <= 1} onClick={() => setSeats((n) => Math.max(1, n - 1))} className="rounded-full p-1.5 text-base-content hover:bg-base-content/10 disabled:opacity-30">
                    <MinusIcon className="h-4 w-4" aria-hidden />
                  </button>
                  <span className="min-w-20 text-center text-sm font-semibold tabular-nums text-base-content">
                    {seats} {seats === 1 ? "person" : "people"}
                  </span>
                  <button type="button" aria-label="One person more" onClick={() => setSeats((n) => n + 1)} className="rounded-full p-1.5 text-base-content hover:bg-base-content/10">
                    <PlusIcon className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              )}
            </Step>

            <Step n={offer === "none" ? 3 : 4} title="Billing">
              <DarkBillingSwitch billing={billing} onChange={setBilling} />
            </Step>
          </div>

          {/* The total, in view while they build it */}
          <div className="rounded-[2rem] bg-base-content/[0.05] p-7 shadow-[0_0_120px_-30px] shadow-primary ring-1 ring-primary/40 backdrop-blur-md sm:p-9 lg:sticky lg:top-24">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Your Price</p>
            <p className="mt-3 flex items-baseline gap-2" aria-live="polite">
              <span className="text-7xl font-semibold tracking-tight tabular-nums text-base-content [font-family:var(--font-tracker-display)] sm:text-8xl">{quote.hasQuote && !quote.monthly ? "Custom" : formatPrice(total)}</span>
              {!(quote.hasQuote && !quote.monthly) && <span className="text-base font-medium text-base-content/60">/ mo</span>}
            </p>
            <p className={`${mk.small} mt-2 min-h-5`}>
              {free ? "The Duty Calculator and tracking, free." : !quote.annualSavings ? "Billed monthly" : billing === "annual" ? `${formatPrice(yearly)} a year` : `Or save ${formatPrice(quote.annualSavings)} a year on annual`}
              {billing === "annual" && quote.annualSavings > 0 && <span className="font-semibold text-success"> · saves {formatPrice(quote.annualSavings)} a year</span>}
            </p>

            <ul className="mt-7 flex flex-col gap-3 border-t border-base-content/15 pt-6">
              {quote.lines.length === 0 && <li className="text-sm text-base-content/70">Unlimited lookups, and every product you track.</li>}
              {quote.lines.map((line) => (
                <li key={line.id} className="flex items-baseline justify-between gap-4">
                  <span className="min-w-0">
                    <span className="block font-semibold text-base-content">{line.label}</span>
                    <span className={mk.small}>{line.detail}</span>
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums text-base-content">{line.monthly === null ? "Let's talk" : `${formatPrice(line.monthly)}/mo`}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              {quote.hasQuote ? (
                <a href={QUOTE_HREF} target="_blank" rel="noopener noreferrer" className={`${cta.buttonPrimary} w-full`}>
                  Talk to Us <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </a>
              ) : (
                <EntryCta page="pricing" entry={onlyClassify ? "classify" : "pricing_page"} section="calculator" label={free ? "Track My Products Free" : onlyClassify ? "Get Started" : MAIN_CTA} className={`${cta.buttonPrimary} w-full`}>
                  {free ? "Track My Products Free" : onlyClassify ? "Get Started" : MAIN_CTA} <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </EntryCta>
              )}
              <p className={`${mk.small} mt-3 text-center`}>{quote.hasQuote ? "Volume pricing for large catalogs." : offer === "none" ? "No credit card required." : `Free for ${REVERSE_TRIAL.days} days · No credit card required`}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
