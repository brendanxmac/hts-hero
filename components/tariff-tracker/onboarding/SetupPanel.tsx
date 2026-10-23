"use client";

import { ComponentType, SVGProps } from "react";
import {
  ArrowRightIcon,
  ArrowTrendingUpIcon,
  BellAlertIcon,
  CheckIcon,
  DocumentMagnifyingGlassIcon,
  LockClosedIcon,
  PlayIcon,
  ReceiptPercentIcon,
  ScaleIcon,
  ShieldCheckIcon,
  TableCellsIcon,
} from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { REVERSE_TRIAL } from "@/components/pricing-calculator/lib/pricing";
import { AUTHORITIES } from "@/libs/tariff-updates/types";
import { shortDate } from "../../duty-calculator/rate-history/format";
import { NEWS_DOTS as DOTS, newsToneOf as toneOf } from "../news/tone";
import { useTariffUpdates } from "../overview/useTariffUpdates";
import { openImportTakeover } from "./takeoverStore";
import { openFeatureTour } from "./tour/tourStore";
import { delay } from "./parts";

// The Tracker with none of the user's imports yet (the Home and Imports pages): the whole page is
// the pitch for adding them. What it does for them, the tariff actions landing right now (why it
// matters today), every feature, and one ask, made twice: "Set up my imports", which always opens
// the import takeover at its start, so everyone goes through the same setup flow. No example
// dashboard and no banner above it: this is the one ask on the page. Under the pitch, the feature
// tour's teaser (TourTeaser): what's waiting once the imports are in, and the way into the tour.

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

const FEATURES: { Icon: Icon; title: string; body: string; tone: string }[] = [
  { Icon: TableCellsIcon, title: "Every Tariff on Every Import", body: "Base duty, Section 232, 301, 122 and reciprocal, worked out for each code and country.", tone: "bg-primary/10 text-primary" },
  { Icon: BellAlertIcon, title: "Alerts the Day a Tariff Hits", body: "Every new tariff action is checked against your imports, and you hear about the ones that touch them.", tone: "bg-error/10 text-error" },
  { Icon: ArrowTrendingUpIcon, title: "What Changed, and When", body: "Each rate's history for the last 12 months, before and after every change.", tone: "bg-info/10 text-info" },
  { Icon: ScaleIcon, title: "AD/CVD Cases That May Apply", body: "Antidumping and countervailing duty cases flagged on the imports they may cover.", tone: "bg-warning/10 text-warning" },
  {
    Icon: ReceiptPercentIcon,
    title: "Where You Could Pay Less",
    body: "Trade programs and lower-duty origins your imports may qualify for.",
    tone: "bg-success/10 text-success",
  },
  {
    Icon: DocumentMagnifyingGlassIcon,
    title: "Your Past Entries, Checked",
    body: "Duty you may have overpaid on past entries, and could recover.",
    tone: "bg-secondary/10 text-secondary",
  },
];

const PROMISES = ["Takes about a minute", `Free for ${REVERSE_TRIAL.days} days`, "No credit card"];
const ACTIONS = 3;

const Cta = ({ from, where }: { from: string; where: string }) => (
  <button
    type="button"
    className={`${ui.button({ variant: "primary", size: "lg" })} h-14 px-8 text-lg`}
    onClick={() => openImportTakeover(`${from}-${where}`, "hook")}
  >
    Set up my imports
    <ArrowRightIcon className="h-5 w-5" aria-hidden />
  </button>
);

const Promises = () => (
  <ul className="m-0 flex list-none flex-wrap items-center gap-x-5 gap-y-1.5 p-0 text-sm text-base-content/65">
    {PROMISES.map((p) => (
      <li key={p} className="flex items-center gap-1.5">
        <CheckIcon className="h-4 w-4 text-success" aria-hidden />
        {p}
      </li>
    ))}
  </ul>
);

// Why today: the latest tariff actions, as they landed (from /tariff-updates)
const LatestActions = () => {
  const updates = useTariffUpdates();
  const thisYear = new Date().getFullYear().toString();
  const latest = (updates ?? []).slice(0, ACTIONS);

  return (
    <div className={`${tt.panel} flex flex-col overflow-hidden`}>
      <div className="flex items-center justify-between gap-3 border-b border-base-300 px-5 py-4">
        <span className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-error/60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-error" />
          </span>
          <span className="text-sm font-semibold text-base-content">Latest Tariff Actions</span>
        </span>
        <a href="/tariff-updates" target="_blank" rel="noopener" className={`${ui.link} text-xs`}>
          All updates
        </a>
      </div>
      <ul className="m-0 flex list-none flex-col p-0" aria-busy={updates === null}>
        {updates === null
          ? Array.from({ length: ACTIONS }, (_, i) => (
            <li key={i} className="border-b border-base-300 px-5 py-3.5 last:border-b-0">
              <div className={`${ui.skeleton} h-4 w-3/4`} />
            </li>
          ))
          : latest.map((u) => (
            <li key={u.slug} className="border-b border-base-300 last:border-b-0">
              <a
                href={`/tariff-updates/${u.slug}`}
                target="_blank"
                rel="noopener"
                className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-tt-soft"
              >
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${DOTS[toneOf(u.kind)]}`} aria-hidden />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="line-clamp-2 text-sm text-base-content">{u.title}</span>
                  <span className="text-xs text-base-content/55">
                    {AUTHORITIES[u.authority as keyof typeof AUTHORITIES] ?? u.authority} ·{" "}
                    {shortDate(u.last_activity_at.slice(0, 10), u.last_activity_at.slice(0, 4) !== thisYear)}
                  </span>
                </span>
              </a>
            </li>
          ))}
      </ul>
      <p className="m-0 flex items-center gap-2 border-t border-base-300 bg-tt-soft px-5 py-3 text-xs text-base-content/70">
        <BellAlertIcon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
        After uploading your imports, each one is checked against each update the day it lands.
      </p>
    </div>
  );
};

// What the tour shows, as things that would already be happening with their imports in: each
// card one feature, locked until there are imports. Examples, in the Tracker's own terms (rates
// before → after in %, savings as "may qualify").
const TEASERS: { Icon: Icon; tone: string; label: string; title: string; detail: string }[] = [
  { Icon: BellAlertIcon, tone: "bg-error/15 text-error", label: "Tariff alert", title: "A rate change hits 3 of your imports", detail: "Steel brackets, China: 52.9% → 77.9%" },
  { Icon: ScaleIcon, tone: "bg-warning/15 text-warning", label: "AD/CVD", title: "A case may cover one of your imports", detail: "Aluminum extrusions from China" },
  { Icon: TableCellsIcon, tone: "bg-primary/15 text-primary", label: "Every tariff", title: "50.0% duty, every tariff stacked up", detail: "Pump parts from Brazil" },
  {
    Icon: ReceiptPercentIcon,
    tone: "bg-success/15 text-success",
    label: "Savings",
    title: "May qualify for USMCA",
    detail: "Centrifugal pumps, Mexico: 25.0% → 0.0%",
  },
];

// The feature tour's banner: dark, glowing, and a little out of reach. What they're missing, and
// a two-minute look at it.
const TourTeaser = ({ from }: { from: string }) => (
  <section
    aria-labelledby="tt-tour-teaser"
    className="hts-tracker-on-dark relative grid items-center gap-8 overflow-hidden rounded-lg bg-tt-side p-6 text-base-content sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:px-12 lg:py-7"
  >
    <div
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(40rem_22rem_at_85%_20%,color-mix(in_oklab,var(--color-primary)_28%,transparent),transparent),radial-gradient(30rem_18rem_at_10%_110%,color-mix(in_oklab,var(--color-secondary)_18%,transparent),transparent)]"
      aria-hidden
    />
    <div className="relative flex flex-col gap-4">
      <span className={`${tt.eyebrow("primary")} flex items-center gap-2`}>
        <PlayIcon className="h-3.5 w-3.5" aria-hidden />
        Product Tour · 2 minutes
      </span>
      <h2 id="tt-tour-teaser" className={`${tt.display} m-0 text-4xl font-semibold leading-[1.08] tracking-tight lg:text-[2.4rem]`}>
        See What You&apos;re Missing
      </h2>
      <p className="m-0 max-w-xl text-base leading-relaxed text-base-content/75">
        Alerts the day a tariff hits, every duty stacked up, AD/CVD cases flagged before they surprise you. Take a quick tour of everything
        that starts working the moment your imports are in.
      </p>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <button
          type="button"
          className={`${ui.button({ variant: "primary", size: "lg" })} h-14 px-7 text-lg shadow-[0_14px_34px_-12px_var(--color-primary)]`}
          onClick={() => openFeatureTour(`${from}-teaser`, "imports")}
        >
          <PlayIcon className="h-5 w-5" aria-hidden />
          Take the tour
        </button>
        <button
          type="button"
          className="text-sm font-semibold text-base-content/70 underline-offset-4 hover:text-base-content hover:underline"
          onClick={() => openImportTakeover(`${from}-teaser`, "hook")}
        >
          or set up my imports
        </button>
      </div>
    </div>

    {/* What's waiting: each card a feature, locked until the imports are in */}
    <ul className="relative m-0 grid list-none gap-2.5 p-0 sm:grid-cols-2" aria-label="What the Tracker does with your imports">
      {TEASERS.map((t, i) => (
        <li
          key={t.label}
          className={`tt-ob-rise relative flex flex-col gap-2 rounded-xl bg-tt-side-card p-3.5 ring-1 ring-white/5 ${i % 2 ? "sm:translate-y-4" : ""}`}
          style={delay(150 + i * 110)}
        >
          <span className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <span className={`relative flex h-8 w-8 items-center justify-center rounded-lg ${t.tone}`} aria-hidden>
                {i === 0 && <span className="tt-ob-ping absolute inset-0 rounded-lg bg-error/30" style={delay(900)} />}
                <t.Icon className="relative h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">{t.label}</span>
            </span>
          </span>
          <span className="text-sm font-semibold leading-snug text-base-content">{t.title}</span>
          <span className="text-xs text-base-content/60">{t.detail}</span>
          <span className="mt-0.5 flex items-center gap-1.5 border-t border-white/10 pt-2 text-[0.7rem] font-semibold text-base-content/50">
            <LockClosedIcon className="h-3 w-3" aria-hidden />
            Waits for your imports
          </span>
        </li>
      ))}
    </ul>
  </section>
);

// `from`: where it sits, for analytics ("overview", "imports")
export const SetupPage = ({ from }: { from: string }) => (
  <div className="tt-enter flex flex-col gap-6">
    {/* The pitch, the ask, and why it matters today */}
    <section
      aria-labelledby="tt-setup-title"
      className={`${tt.panel} relative grid items-center gap-10 overflow-hidden p-6 sm:p-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:px-12 lg:py-8`}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_30rem_at_0%_0%,color-mix(in_oklab,var(--color-primary)_14%,transparent),transparent)]"
        aria-hidden
      />
      <div className="relative flex flex-col gap-4">
        <span className={`${tt.chip("primary")} self-start`}>Tariff Tracker</span>
        <h1
          id="tt-setup-title"
          className={`${tt.display} m-0 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight text-base-content lg:text-[3rem]`}
        >
          {/* The home page's headline (components/home/hero/HeroTicker.tsx) */}
          Tariff Alerts, Savings, &amp; Audits <span className="text-primary">on Autopilot</span>
        </h1>
        <p className="m-0 max-w-2xl text-lg leading-relaxed text-base-content/75">
          Add your HTS codes and countries of origin once. We work out today&apos;s duty on each import, check every new tariff action
          against them, and tell you what changed.
        </p>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <Cta from={from} where="hero" />
          </div>
          <Promises />
        </div>
        <p className="m-0 flex items-center gap-2 text-sm text-base-content/60">
          <ShieldCheckIcon className="h-4 w-4 text-success" aria-hidden />
          Upload your spreadsheet as it is. It&apos;s read in your browser, and only codes and countries are kept.
        </p>
      </div>
      <div className="relative">
        <LatestActions />
      </div>
    </section>

    <TourTeaser from={from} />

    {/* Everything it does */}
    <section aria-labelledby="tt-setup-features" className="flex flex-col gap-5 py-4">
      <div className="flex flex-col gap-2 px-1">
        <span className={tt.eyebrow("primary")}>What you get</span>
        <h2 id="tt-setup-features" className={`${tt.display} m-0 text-3xl font-semibold tracking-tight text-base-content`}>
          Everything the Tracker Watches for You
        </h2>
      </div>
      <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-2 xl:grid-cols-3">
        {FEATURES.map((f) => (
          <li key={f.title} className={`${tt.panel} flex flex-col gap-3 p-6`}>
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${f.tone}`} aria-hidden>
              <f.Icon className="h-5 w-5" />
            </span>
            <span className="flex flex-wrap items-center gap-2 text-base font-semibold text-base-content">
              {f.title}
            </span>
            <span className="text-sm leading-relaxed text-base-content/65">{f.body}</span>
          </li>
        ))}
      </ul>
    </section>

    {/* The ask again, for anyone who read on */}
    <section className="flex flex-col items-center gap-5 rounded-2xl bg-primary/8 px-6 py-12 text-center ring-1 ring-primary/20">
      <h2 className={`${tt.display} m-0 max-w-3xl text-3xl font-semibold tracking-tight text-base-content`}>
        All It Takes Is an HTS Code and a Country of Origin.
      </h2>
      <p className="m-0 max-w-xl text-base text-base-content/70">
        Upload a spreadsheet, paste a list or pick from your recent duty lookups. Your {REVERSE_TRIAL.days}-day free trial starts when
        you add them.
      </p>
      <Cta from={from} where="footer" />
      <Promises />
    </section>
  </div>
);
