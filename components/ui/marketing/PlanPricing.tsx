"use client";

import Link from "next/link";
import { ArrowRightIcon, BuildingOffice2Icon, CheckBadgeIcon, CheckIcon, ShieldCheckIcon } from "@heroicons/react/20/solid";
import { ANNUAL_DISCOUNT, Billing, formatPrice, monthlyRate, perImportPrice } from "@/components/pricing-calculator/lib/pricing";
import * as mk from "./styles";

// The plan cards the sales pages share (/tariff-alerts, /tariff-audit): a billing switch and a
// products slider, four standard cards side by side with the one that fits the visitor's products
// highlighted (past the largest plan, the large-catalog demo row is instead), slim demo rows under
// them and the guarantee under everything. Each page brings its plans and what each includes; the
// cards show the products and users first, in bold.

export type SalesPlan = { name: string; maxPairs: number; price: number; emails: number; teams: boolean };

// Under a dollar reads as cents ("64¢"); a dollar or more stays in dollars ("$4.90")
const perProduct = (amount: number) => (amount < 1 ? `${Math.round(amount * 100)}¢` : `$${amount.toFixed(2)}`);

// Monthly or annual, in theme colors so it sits on the page or in a dark card
export const DarkBillingSwitch = ({ billing, onChange }: { billing: Billing; onChange: (b: Billing) => void }) => (
  <div className="inline-flex items-center gap-1 rounded-full bg-base-content/10 p-1" role="radiogroup" aria-label="Billing period">
    {(["monthly", "annual"] as const).map((b) => {
      const on = billing === b;
      return (
        <button
          key={b}
          type="button"
          role="radio"
          aria-checked={on}
          onClick={() => onChange(b)}
          className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${on ? "bg-primary text-primary-content shadow" : "text-base-content/70 hover:text-base-content"}`}
        >
          {b === "monthly" ? "Monthly" : "Annual"}
          {b === "annual" && (
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${on ? "bg-primary-content/20 text-primary-content" : "bg-base-content/10 text-base-content/70"}`}>
              Save {ANNUAL_DISCOUNT * 100}%
            </span>
          )}
        </button>
      );
    })}
  </div>
);

// The products slider scales to the plans: each plan gets an equal stretch of the track, from the
// plan below it up to its own size, in round steps that fit that stretch (1s at the small end, 25s at
// the large). One last notch past the end is "more than the largest plan"
const STRETCH = 20;
const ROUND_STEPS = [1, 5, 10, 25, 50, 100];

const sliderScale = (plans: readonly SalesPlan[]) => {
  const tops = plans.map((p) => p.maxPairs);
  const largest = tops[tops.length - 1];
  const bottom = (i: number) => (i ? tops[i - 1] : 1);
  const step = (i: number) => ROUND_STEPS.find((s) => s >= (tops[i] - bottom(i)) / STRETCH) ?? ROUND_STEPS[ROUND_STEPS.length - 1];
  const end = tops.length * STRETCH;

  // Track position to products
  const toProducts = (at: number) => {
    if (at > end) return largest + 1;
    const i = Math.min(Math.floor(at / STRETCH), tops.length - 1);
    const raw = bottom(i) + ((at - i * STRETCH) / STRETCH) * (tops[i] - bottom(i));
    return Math.max(1, Math.round(raw / step(i)) * step(i));
  };
  // Products to track position
  const toAt = (n: number) => {
    if (n > largest) return end + 1;
    const i = tops.findIndex((t) => n <= t);
    return Math.round(i * STRETCH + ((n - bottom(i)) / (tops[i] - bottom(i))) * STRETCH);
  };
  return { largest, end, toProducts, toAt };
};

// The smallest plan that covers this many products; null past the largest
export const bestPlanFor = (plans: readonly SalesPlan[], products: number) => plans.find((p) => products <= p.maxPairs)?.maxPairs ?? null;

// How many products the visitor has, as a minimal slider in the billing switch's pill
export const ProductsSlider = ({ plans, products, onChange }: { plans: readonly SalesPlan[]; products: number; onChange: (n: number) => void }) => {
  const { largest, end, toProducts, toAt } = sliderScale(plans);
  const at = toAt(products);
  const fill = (at / (end + 1)) * 100;
  const label = products > largest ? `${largest}+` : `${products}`;
  return (
    <label className="inline-flex items-center gap-3 rounded-full bg-base-content/10 py-2 pl-4 pr-4 text-sm font-semibold text-base-content/70">
      <span>Number of Products</span>
      <input
        type="range"
        min={0}
        max={end + 1}
        step={1}
        value={at}
        onChange={(e) => onChange(toProducts(Number(e.target.value)))}
        aria-valuetext={`${label} products`}
        className="h-1.5 w-32 cursor-pointer appearance-none rounded-full sm:w-44 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-primary [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:ring-4 [&::-webkit-slider-thumb]:ring-primary/20"
        style={{ background: `linear-gradient(to right, var(--color-primary) ${fill}%, color-mix(in oklab, var(--color-base-content) 20%, transparent) ${fill}%)` }}
      />
      <span className="w-10 text-right text-base font-bold tabular-nums text-base-content">{label}</span>
    </label>
  );
};

// One plan's card. On annual, the yearly charge sits quietly under the per-import price
const PlanCard = ({
  product,
  plan,
  billing,
  features,
  href,
  guarantee,
  note,
  lead,
  best,
  products,
}: {
  product: string;
  plan: SalesPlan;
  billing: Billing;
  features: string[];
  href: string;
  guarantee?: string;
  note?: string | null;
  lead: string;
  best?: boolean;
  products?: number;
}) => {
  const price = monthlyRate(plan.price, billing);
  const id = `plan-${plan.maxPairs}`;
  const planSpecificFeatures = [lead, plan.emails === 1 ? "1 user / email" : `Up to ${plan.emails} users / emails`]

  if (plan.teams) {
    planSpecificFeatures.push('Slack & Microsoft Teams Integration')
  }

  return (
    <article
      className={`relative flex flex-col rounded-3xl p-7 transition-all duration-300 ${best
          ? "hts-tracker-inverse bg-base-100 shadow-2xl shadow-black/30"
          : `bg-tt-soft shadow-xl shadow-base-content/5 ring-1 ring-base-content/15 hover:-translate-y-1 hover:shadow-2xl hover:ring-primary/50`
        }`}
      aria-labelledby={id}
    >
      {/* The plan that fits the visitor's products, from the slider */}
      {best && (
        <span className="absolute -top-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-success px-4 py-1.5 text-sm font-bold text-success-content">
          <CheckBadgeIcon className="h-4 w-4" aria-hidden /> Best Fit for {products} {products === 1 ? "Product" : "Products"}
        </span>
      )}
      <h3 id={id} className="text-base-content [font-family:var(--font-tracker-display)]">
        <span className="block text-xs font-bold uppercase tracking-wider text-base-content/55">{product} </span>
        <span className="block text-2xl font-semibold">{plan.name}</span>
      </h3>

      <p className="mt-6 flex items-baseline gap-2">
        <span className="text-5xl font-bold tracking-tight text-base-content [font-family:var(--font-tracker-display)]">{formatPrice(price)}</span>
        <span className="text-sm font-medium text-base-content/60">/ mo</span>
      </p>
      {/* What each product costs, the number that sells it */}
      <p className="mt-3 text-base text-base-content/70">
        Just <span className="font-bold tabular-nums text-success">{perProduct(perImportPrice({ price, maxPairs: plan.maxPairs }))}</span> per product
      </p>
      {/* The page's reason the price is worth it, if it has one, right under the price */}
      {note && (
        <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-success">
          <CheckBadgeIcon className="h-4 w-4 shrink-0" aria-hidden /> {note}
        </p>
      )}
      {/* On annual, what's charged once a year, quietly */}
      {billing === "annual" && <p className="mt-0.5 text-xs text-base-content/50">{formatPrice(price * 12)} billed yearly</p>}

      <ul className="mt-6 flex flex-col gap-3 border-t border-base-content/15 pt-6">
        {features.map((text) => (
          <li key={text} className="flex gap-2.5 text-sm text-base-content/80">
            <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
            {text}
          </li>
        ))}
        {planSpecificFeatures.map((text) => (
          <li key={text} className="flex gap-2.5 text-sm font-semibold text-base-content">
            <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
            {text}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-8">
        <Link
          href={href}
          className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-base font-semibold text-primary-content transition-colors hover:bg-primary/90"
        >
          Get {plan.name} <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
        {/* The page's guarantee, if it has one, tiny under the button */}
        {guarantee && (
          <p className="mt-2.5 flex items-center justify-center gap-1 text-xs font-semibold text-success">
            <ShieldCheckIcon className="h-3.5 w-3.5 shrink-0" aria-hidden /> {guarantee}
          </p>
        )}
        <p className={`${guarantee ? "mt-1" : "mt-2.5"} text-center text-xs text-base-content/60`}>Cancel anytime</p>
      </div>
    </article>
  );
};

export const PlanCards = ({
  product,
  plans,
  billing,
  features,
  href,
  guarantee,
  note,
  lead,
  best,
  products,
}: {
  product: string;
  plans: readonly SalesPlan[];
  billing: Billing;
  features: (plan: SalesPlan, billing: Billing) => string[];
  href: string;
  guarantee?: string;
  note?: (plan: SalesPlan, billing: Billing) => string | null;
  // The card's bold first line: what the plan covers, by its number of products
  lead: (plan: SalesPlan) => string;
  // The highlighted plan's products (bestPlanFor), if any
  best?: number | null;
  // The slider's count, for the highlighted plan's badge
  products?: number;
}) => (
  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
    {plans.map((p) => (
      <PlanCard key={p.maxPairs} product={product} plan={p} billing={billing} features={features(p, billing)} href={href} guarantee={guarantee} note={note?.(p, billing)} lead={lead(p)} best={p.maxPairs === best} products={products} />
    ))}
  </div>
);

// A slim row under the cards that leads to a call
export const DemoRow = ({ title, text, href, label = "Book a Demo", best }: { title: string; text: string; href: string; label?: string; best?: boolean }) => (
  <div className={`flex flex-col items-start gap-4 rounded-3xl bg-tt-soft p-5 transition-shadow sm:flex-row sm:items-center sm:justify-between sm:p-6 ${best ? "shadow-2xl shadow-success/20 ring-2 ring-success" : "ring-1 ring-base-content/15"}`}>
    <div className="flex items-start gap-3.5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <BuildingOffice2Icon className="h-5 w-5" aria-hidden />
      </span>
      <div>
        <p className="font-semibold text-base-content [font-family:var(--font-tracker-display)]">{title}</p>
        <p className="mt-0.5 text-sm text-base-content/70">{text}</p>
      </div>
    </div>
    <a href={href} target="_blank" rel="noopener noreferrer" className={`${mk.buttonSecondary} shrink-0`}>
      {label}
    </a>
  </div>
);

// The guarantee, under everything
export const GuaranteeBox = ({ title, text }: { title: string; text: string }) => (
  <div className="mt-8 flex flex-col items-center gap-2 rounded-3xl bg-success/10 px-7 py-6 text-center ring-1 ring-success/30">
    <p className="flex items-center gap-2.5 text-lg font-semibold text-base-content [font-family:var(--font-tracker-display)]">
      <ShieldCheckIcon className="h-6 w-6 text-success" aria-hidden />
      {title}
    </p>
    <p className="max-w-3xl text-sm leading-relaxed text-base-content/70">{text}</p>
  </div>
);
