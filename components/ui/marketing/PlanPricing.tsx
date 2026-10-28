"use client";

import Link from "next/link";
import { ArrowRightIcon, BuildingOffice2Icon, CheckIcon, ShieldCheckIcon } from "@heroicons/react/20/solid";
import { ANNUAL_DISCOUNT, Billing, formatPrice, monthlyRate, perImportPrice } from "@/components/pricing-calculator/lib/pricing";
import * as mk from "./styles";

// The plan cards the sales pages share (/tariff-alerts, /tariff-audit): a billing switch, four
// standard cards side by side, none highlighted (the right one depends on the catalog), slim demo
// rows under them and the guarantee under everything. Each page brings its plans and what each
// includes; the cards show the imports and users first, in bold.

export type SalesPlan = { name: string; maxPairs: number; price: number; emails: number; teams: boolean };

// Under a dollar reads as cents ("64¢"); a dollar or more stays in dollars ("$4.90")
const perImport = (amount: number) => (amount < 1 ? `${Math.round(amount * 100)}¢` : `$${amount.toFixed(2)}`);

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
          className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${on ? "bg-base-content text-base-100 shadow" : "text-base-content/70 hover:text-base-content"}`}
        >
          {b === "monthly" ? "Monthly" : "Annual"}
          {b === "annual" && (
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${on ? "bg-success text-success-content" : "bg-success/15 text-success"}`}>
              Save {ANNUAL_DISCOUNT * 100}%
            </span>
          )}
        </button>
      );
    })}
  </div>
);

// One plan's card. On annual, the yearly charge sits quietly under the per-import price
const PlanCard = ({
  product,
  plan,
  billing,
  features,
  href,
  guarantee,
}: {
  product: string;
  plan: SalesPlan;
  billing: Billing;
  features: string[];
  href: string;
  guarantee?: string;
}) => {
  const price = monthlyRate(plan.price, billing);
  const id = `plan-${plan.maxPairs}`;
  return (
    <article
      className="flex flex-col rounded-3xl bg-tt-soft p-7 shadow-xl shadow-base-content/5 ring-1 ring-base-content/15 transition-all hover:-translate-y-1 hover:shadow-2xl hover:ring-primary/50"
      aria-labelledby={id}
    >
      <h3 id={id} className="text-base-content [font-family:var(--font-tracker-display)]">
        <span className="block text-xs font-bold uppercase tracking-wider text-base-content/55">{product} </span>
        <span className="block text-2xl font-semibold">{plan.name}</span>
      </h3>

      <p className="mt-6 flex items-baseline gap-2">
        <span className="text-5xl font-bold tracking-tight text-base-content [font-family:var(--font-tracker-display)]">{formatPrice(price)}</span>
        <span className="text-sm font-medium text-base-content/60">/ mo</span>
      </p>
      {/* What each import costs, the number that sells it */}
      <p className="mt-3 text-base text-base-content/70">
        Just <span className="font-bold tabular-nums text-success">{perImport(perImportPrice({ price, maxPairs: plan.maxPairs }))}</span> per import
      </p>
      {/* On annual, what's charged once a year, quietly */}
      {billing === "annual" && <p className="mt-0.5 text-xs text-base-content/50">{formatPrice(price * 12)} billed yearly</p>}

      <ul className="mt-6 flex flex-col gap-3 border-t border-base-content/15 pt-6">
        {[`Audits for up to ${plan.maxPairs} imports`, plan.emails === 1 ? "1 user / email" : `Up to ${plan.emails} users / emails`].map((text) => (
          <li key={text} className="flex gap-2.5 text-sm font-semibold text-base-content">
            <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
            {text}
          </li>
        ))}
        {features.map((text) => (
          <li key={text} className="flex gap-2.5 text-sm text-base-content/80">
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
}: {
  product: string;
  plans: readonly SalesPlan[];
  billing: Billing;
  features: (plan: SalesPlan) => string[];
  href: string;
  guarantee?: string;
}) => (
  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
    {plans.map((p) => (
      <PlanCard key={p.maxPairs} product={product} plan={p} billing={billing} features={features(p)} href={href} guarantee={guarantee} />
    ))}
  </div>
);

// A slim row under the cards that leads to a call
export const DemoRow = ({ title, text, href, label = "Book a Demo" }: { title: string; text: string; href: string; label?: string }) => (
  <div className="flex flex-col items-start gap-4 rounded-3xl bg-tt-soft p-5 ring-1 ring-base-content/15 sm:flex-row sm:items-center sm:justify-between sm:p-6">
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
