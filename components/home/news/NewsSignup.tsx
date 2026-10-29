import { CheckIcon, NewspaperIcon } from "@heroicons/react/20/solid";
import { SubscribeForm } from "@/components/tariff-updates/SubscribeForm";
import * as mk from "@/components/ui/marketing/styles";

// The free way in for visitors not ready to buy, before the FAQ: the Weekly Tariff Brief
// (the Tariff News digest, /tariff-updates), by email. After subscribing, the form offers Tariff
// Alerts on their own products.

const POINTS = [
  "Every new US tariff action, in plain English",
  "Links to the official documents behind each one",
  "Every Monday, or as it happens. Unsubscribe anytime",
];

export const NewsSignup = () => (
  <section id="news" className={`${mk.band} scroll-mt-20`} aria-labelledby="news-title">
    <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
      <div className="grid grid-cols-1 items-center gap-10 rounded-3xl bg-tt-soft p-8 ring-1 ring-base-content/15 sm:p-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <NewspaperIcon className="h-4 w-4" aria-hidden /> Free Tariff News
          </p>
          <h2 id="news-title" className={`${mk.h2} mt-4`}>
            Get the <span className={mk.accent}>Weekly Tariff Brief</span>
          </h2>
          <p className={`${mk.lead} mt-4`}>Not ready for alerts yet? Stay on top of every tariff change for free.</p>
          <ul className="mt-6 flex flex-col gap-2.5">
            {POINTS.map((p) => (
              <li key={p} className="flex gap-2.5 text-base-content/70">
                <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-success" aria-hidden />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <SubscribeForm source="home" />
      </div>
    </div>
  </section>
);
