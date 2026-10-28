import type { ReactNode } from "react";
import Image from "next/image";
import logo from "@/app/logo.svg";
import type { AlertExample } from "@/libs/tariff-alerts-example";

// "Get Alerts, ASAP!" as one timeline of a real tariff (Section 301 on Brazil): the alerts HTS Hero
// sent, stacked one over the other, with the dates on a rail beside them. When it was proposed, when
// it was published with the exact rates, and then the day the duty started.

const DAY_MS = 86_400_000;

const shortDay = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

const daysBetween = (from: string, to: string) => Math.round((Date.parse(to) - Date.parse(from)) / DAY_MS);

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

// The notification itself
const Alert = ({ text }: { text: string }) => (
  <div className="flex items-center gap-3.5 rounded-2xl bg-base-100 p-4 shadow-xl shadow-primary/10 ring-2 ring-primary/50 sm:p-5">
    <Image src={logo} alt="" width={40} height={40} className="shrink-0" />
    <div className="min-w-0 flex-1">
      <p className="flex items-center justify-between gap-2 text-sm">
        <span className="font-semibold text-base-content">HTS Hero</span>
        <span className="text-xs font-semibold uppercase tracking-wide text-primary">Tariff Alert</span>
      </p>
      <p className="mt-0.5 text-base font-semibold leading-snug text-base-content sm:text-lg">{text}</p>
    </div>
  </div>
);

// One stop on the rail: its dot, its date and what happened, and what we sent
const Stop = ({ date, label, dot, children }: { date: string; label: string; dot: string; children?: ReactNode }) => (
  <li className="relative grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-5 pb-10 last:pb-0">
    <span className={`relative z-10 mt-1 h-5 w-5 rounded-full ring-4 ring-slate-50 skin:ring-tt-soft ${dot}`} aria-hidden />
    <div>
      <p className="text-sm font-semibold text-base-content/70">
        <time dateTime={date} className="text-base-content">
          {shortDay(date)}
        </time>
        <span className="mx-2 text-base-content/30">·</span>
        {label}
      </p>
      {children && <div className="mt-3">{children}</div>}
    </div>
  </li>
);

export const EarlyTimeline = ({ example }: { example: AlertExample }) => {
  const { proposed, published, effective } = example.milestones;
  const hit = example.rows.filter((r) => r.afterPct > r.beforePct).length;
  const lead = daysBetween(proposed, effective);

  return (
    <figure className="mx-auto w-full max-w-2xl" aria-label={`Two alerts for one tariff, the first ${plural(lead, "day")} before its duty started`}>

      <ol className="relative">
        {/* The rail, from the first alert to the duty */}
        <span className="absolute bottom-2 left-[calc(0.625rem-1px)] top-2 w-0.5 bg-linear-to-b from-primary via-primary/60 to-error" aria-hidden />
        <Stop date={proposed} label="Proposed" dot="bg-primary">
          <Alert text={`A proposed tariff might affect ${hit} of your imports`} />
        </Stop>
        <Stop date={published} label={`Published, ${plural(daysBetween(proposed, published), "day")} later`} dot="bg-primary">
          <Alert text={`A new tariff affects ${hit} of your imports`} />
        </Stop>
        <Stop date={effective} label="New duty starts on your entries" dot="bg-error" />
      </ol>
    </figure>
  );
};
