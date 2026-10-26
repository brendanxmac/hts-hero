import Link from "next/link";
import { ArrowDownTrayIcon, ArrowRightIcon, BellAlertIcon, BoltIcon, NewspaperIcon } from "@heroicons/react/20/solid";
import * as mk from "@/components/ui/marketing/styles";
import { AUTO_AUDITING, SAVINGS_DETECTION } from "@/components/ui/marketing/comingSoon";
import { LINKS } from "../lib/links";
import { LOWEST_PER_IMPORT, TRACKER_TIERS, TRY_IT_FREE, formatPrice } from "../lib/pricing";

// The core of the Tariff Tracker in one place, under the tariff plans: impact checks, Tariff News
// and alerts side by side, then export and rate history as one strip. Tracker MVP (MVP_TRIM.md).
const CORE = [
  {
    Icon: BoltIcon,
    title: "Impact Checks",
    body: "Pick any tariff action and see exactly how it affects each of your imports, with the rate before and after.",
  },
  {
    Icon: NewspaperIcon,
    title: "Tariff News",
    body: "Every US tariff action from CBP, the Federal Register, USTR, USITC and the White House, as it happens.",
  },
  {
    Icon: BellAlertIcon,
    title: "Alerts",
    body: "When a change hits a tracked import, you hear about it with its rate before and after, and the change in %. AD/CVD alerts included.",
  },
];

export const TrackerCore = () => (
  <section
    className="mt-6 overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-xs"
    aria-labelledby="tracker-core-title"
  >
    <div className="flex flex-col gap-6 p-7 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className={mk.eyebrow}>The Tariff Tracker</p>
          <h3 id="tracker-core-title" className={`${mk.h3} mt-2`}>
            Impact Checks, Tariff News and Alerts in One Place
          </h3>
          <p className="m-0 mt-2 text-sm text-base-content/60">
            From {formatPrice(TRACKER_TIERS[0].price)}/mo · as low as {formatPrice(LOWEST_PER_IMPORT)} per import, per month
          </p>
        </div>
        <Link href={LINKS.signUp} className={`${mk.buttonPrimary} h-12 px-6`}>
          {TRY_IT_FREE} <ArrowRightIcon className="h-4 w-4" aria-hidden />
        </Link>
      </div>
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {CORE.map(({ Icon, title, body }) => (
          <li key={title} className="flex gap-4 rounded-2xl bg-tt-soft p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary" aria-hidden>
              <Icon className="h-5 w-5" />
            </span>
            <span className="flex flex-col gap-1">
              <span className="font-semibold text-base-content">{title}</span>
              <span className="text-sm leading-relaxed text-base-content/70">{body}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
    <div className="flex flex-col gap-3 border-t border-base-300 bg-primary/[0.05] px-7 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <p className="m-0 flex items-start gap-3 text-base-content/80">
        <ArrowDownTrayIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
        <span>
          <span className="font-semibold text-base-content">Export every tariff on every import to CSV or Excel</span>, and see each import&apos;s
          rate history to know how you&apos;ve been affected.
        </span>
      </p>
      <span className="shrink-0 text-sm text-base-content/60">Free with every account</span>
    </div>
    {/* Savings detection and auditing, included at no extra cost */}
    <ul className="m-0 grid grid-cols-1 gap-4 border-t border-base-300 px-7 py-5 sm:px-8 md:grid-cols-2">
      {[SAVINGS_DETECTION, AUTO_AUDITING].map(({ title, text }) => (
        <li key={title} className="flex flex-col gap-1">
          <span className="font-semibold text-base-content">{title}</span>
          <span className="text-sm leading-relaxed text-base-content/70">{text} Included in every Tracker plan at no extra cost.</span>
        </li>
      ))}
    </ul>
  </section>
);
