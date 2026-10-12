import { ReactNode } from "react";
import { CheckIcon, MinusIcon } from "@heroicons/react/20/solid";

// One plan in the tariff pricing section. A plan with an allowance (the Tracker's tier picker) sits
// its five parts on the section grid's shared rows (subgrid). One without (the free calculator)
// is a simpler companion: name, price and features, with its button pinned to the card's foot.
// The headline plan is a dark card.
export const TierCard = ({
  id,
  name,
  description,
  badge,
  dark = false,
  price,
  allowanceLabel,
  allowance,
  allowanceNote,
  cta,
  featuresLabel,
  features,
  excludedFeatures,
}: {
  id: string;
  name: string;
  description: string;
  badge?: string;
  dark?: boolean;
  price: ReactNode;
  // What the plan allows: the Tracker card's tier picker
  allowanceLabel?: string;
  allowance?: ReactNode;
  allowanceNote?: ReactNode;
  cta: ReactNode;
  featuresLabel: string;
  features: string[];
  // Features shown but not on this plan (the Tracker card on its free stop), drawn dimmed
  excludedFeatures?: Set<string>;
}) => {
  const companion = !allowance;
  const label = `text-xs font-bold uppercase tracking-wider ${dark ? "text-slate-400" : "text-slate-500 skin:text-base-content/60"}`;
  return (
    <article
      id={id}
      aria-labelledby={`${id}-title`}
      className={`relative flex flex-col overflow-hidden rounded-3xl lg:row-span-5 ${
        companion ? "" : "lg:grid lg:grid-rows-subgrid lg:gap-0"
      } ${
        dark ? "bg-slate-900 text-white shadow-2xl shadow-slate-900/25" : "border border-slate-200 skin:border-base-300 bg-white skin:bg-base-100 shadow-sm"
      }`}
    >
      {dark && (
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(30rem_16rem_at_100%_0%,rgba(45,212,191,0.25),transparent)]" />
      )}
      <div className="relative flex flex-col gap-2 px-8 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 id={`${id}-title`} className={`text-2xl font-bold ${dark ? "text-white" : "text-slate-900 skin:text-base-content"}`}>
            {name}
          </h3>
          {badge && (
            <span className={`rounded-full px-3 py-1 text-sm font-bold ${dark ? "bg-teal-400 text-slate-950" : "bg-slate-100 skin:bg-tt-soft text-slate-700 skin:text-base-content/80"}`}>
              {badge}
            </span>
          )}
        </div>
        <p className={dark ? "text-slate-300" : "text-slate-600 skin:text-base-content/70"}>{description}</p>
      </div>

      <div className="relative px-8 pt-8">{price}</div>

      {!companion && (
        <div className="relative flex flex-col gap-2.5 px-8 pt-8">
          <span className={label}>{allowanceLabel}</span>
          {allowance}
          <p className={`text-sm ${dark ? "text-slate-400" : "text-slate-500 skin:text-base-content/60"}`} aria-live="polite">
            {allowanceNote}
          </p>
        </div>
      )}

      {!companion && <div className="relative px-8 pt-8">{cta}</div>}

      <div className={`relative mx-8 mt-8 flex flex-col gap-4 border-t py-8 ${dark ? "border-white/10" : "border-slate-100 skin:border-base-300"}`}>
        <span className={label}>{featuresLabel}</span>
        <ul className="flex flex-col gap-3">
          {features.map((f) => {
            const excluded = excludedFeatures?.has(f);
            return (
              <li
                key={f}
                className={`flex gap-3 transition-colors ${
                  excluded ? (dark ? "text-slate-500 skin:text-base-content/60" : "text-slate-400") : dark ? "text-slate-200" : "text-slate-700 skin:text-base-content/80"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors ${
                    excluded ? (dark ? "bg-white/5" : "bg-slate-50 skin:bg-tt-soft ring-1 ring-slate-200 skin:ring-base-300") : dark ? "bg-teal-400/20" : "bg-teal-50 skin:bg-primary/10 ring-1 ring-teal-200 skin:ring-primary/30"
                  }`}
                >
                  {excluded ? (
                    <MinusIcon className={`h-3.5 w-3.5 ${dark ? "text-slate-500 skin:text-base-content/60" : "text-slate-400"}`} aria-hidden />
                  ) : (
                    <CheckIcon className={`h-3.5 w-3.5 ${dark ? "text-teal-300" : "text-teal-600 skin:text-primary"}`} aria-hidden />
                  )}
                </span>
                <span>
                  {excluded && <span className="sr-only">Paid plans only: </span>}
                  {f}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {companion && <div className="relative mt-auto px-8 pb-8">{cta}</div>}
    </article>
  );
};
