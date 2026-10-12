import { ReactNode } from "react";
import { CheckIcon } from "@heroicons/react/20/solid";

// One plan: its name and pitch, its price, what's included and a call to action. A dark card is
// the headline plan of its group; a featured light card gets a teal ring.
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
  // Anything between the price and the features, like a tier table
  children?: ReactNode;
}) => (
  <article
    id={id}
    aria-labelledby={id ? `${id}-title` : undefined}
    className={`relative flex flex-col overflow-hidden rounded-3xl ${
      dark
        ? "bg-slate-900 text-white shadow-2xl shadow-slate-900/25"
        : `border bg-white shadow-sm ${featured ? "border-teal-500 ring-2 ring-teal-500" : "border-slate-200"}`
    }`}
  >
    {dark && (
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(36rem_18rem_at_100%_0%,rgba(45,212,191,0.25),transparent)]" />
    )}
    <div className="relative flex flex-1 flex-col gap-8 p-8 sm:p-10">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 id={id ? `${id}-title` : undefined} className={`text-2xl font-bold ${dark ? "text-white" : "text-slate-900"}`}>
            {name}
          </h3>
          {badge && (
            <span
              className={`rounded-full px-3.5 py-1.5 text-sm font-bold ${
                dark ? "bg-teal-400 text-slate-950" : featured ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {badge}
            </span>
          )}
        </div>
        <p className={dark ? "text-slate-300" : "text-slate-600"}>{description}</p>
      </div>
      {price}
      {children}
      <ul className={`flex flex-col gap-3.5 border-t pt-8 ${dark ? "border-white/10" : "border-slate-100"}`}>
        {features.map((f) => (
          <li key={f} className={`flex gap-3 ${dark ? "text-slate-200" : "text-slate-700"}`}>
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${dark ? "bg-teal-400/20" : "bg-teal-50 ring-1 ring-teal-200"}`}
            >
              <CheckIcon className={`h-3.5 w-3.5 ${dark ? "text-teal-300" : "text-teal-600"}`} aria-hidden />
            </span>
            {f}
          </li>
        ))}
      </ul>
    </div>
    <div className="relative px-8 pb-8 sm:px-10 sm:pb-10">{cta}</div>
  </article>
);
