import { ReactNode } from "react";
import { CheckIcon } from "@heroicons/react/20/solid";

// One plan: its name and pitch, its price, what's included and a call to action. A dark card is
// the headline plan of its group; a featured light card gets a cobalt ring. A compact card puts the
// button beside the price and tightens everything, for a pair of plans that should read at a glance.
export const PlanCard = ({
  id,
  name,
  description,
  price,
  features,
  cta,
  badge,
  featured = false,
  dark = false,
  compact = false,
  children,
}: {
  id?: string;
  name: string;
  description: string;
  price: ReactNode;
  features: string[];
  cta: ReactNode;
  badge?: string;
  featured?: boolean;
  dark?: boolean;
  compact?: boolean;
  // Anything between the price and the features, like a tier table
  children?: ReactNode;
}) => (
  <article
    id={id}
    aria-labelledby={id ? `${id}-title` : undefined}
    className={`relative flex flex-col overflow-hidden rounded-3xl ${
      dark
        ? "hts-tracker-on-dark bg-base-200 text-base-content shadow-2xl shadow-black/25"
        : `border bg-base-100 shadow-sm ${featured ? "border-primary ring-2 ring-primary" : "border-base-300"}`
    }`}
  >
    {dark && (
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(36rem_18rem_at_100%_0%,oklch(var(--p)/0.3),transparent)]" />
    )}
    <div className={`relative flex flex-1 flex-col ${compact ? "gap-5 p-7" : "gap-8 p-8 sm:p-10"}`}>
      <div className={`flex flex-col ${compact ? "gap-1" : "gap-2"}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 id={id ? `${id}-title` : undefined} className={`${compact ? "text-xl" : "text-2xl"} font-bold text-base-content`}>
            {name}
          </h3>
          {badge && (
            <span
              className={`rounded-full ${compact ? "px-3 py-1 text-xs" : "px-3.5 py-1.5 text-sm"} font-bold ${
                dark ? "bg-primary text-primary-content" : featured ? "bg-primary text-primary-content" : "bg-tt-soft text-base-content/80"
              }`}
            >
              {badge}
            </span>
          )}
        </div>
        <p className={`text-base-content/70 ${compact ? "text-sm" : ""}`}>{description}</p>
      </div>
      {compact ? (
        <div className="flex flex-wrap items-center justify-between gap-4">
          {price}
          <div className="shrink-0">{cta}</div>
        </div>
      ) : (
        price
      )}
      {children}
      <ul className={`flex flex-col border-t ${compact ? "gap-2 pt-5 text-sm" : "gap-3.5 pt-8"} ${dark ? "border-base-content/10" : "border-base-300"}`}>
        {features.map((f) => (
          <li key={f} className={`flex ${compact ? "gap-2.5" : "gap-3"} text-base-content/80`}>
            {compact ? (
              <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            ) : (
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${dark ? "bg-primary/20" : "bg-primary/10 ring-1 ring-primary/30"}`}
              >
                <CheckIcon className="h-3.5 w-3.5 text-primary" aria-hidden />
              </span>
            )}
            {f}
          </li>
        ))}
      </ul>
    </div>
    {!compact && <div className="relative px-8 pb-8 sm:px-10 sm:pb-10">{cta}</div>}
  </article>
);
