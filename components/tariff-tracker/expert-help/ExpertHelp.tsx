"use client";

import { ReactNode, useRef, useState } from "react";
import {
  ArrowRightIcon,
  BellAlertIcon,
  ChatBubbleLeftRightIcon,
  CheckIcon,
  ClipboardDocumentCheckIcon,
  DocumentMagnifyingGlassIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  VideoCameraIcon,
} from "@heroicons/react/20/solid";
import config from "@/config";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Billing, formatPrice, MANAGED_ANNUAL_DISCOUNT, MANAGED_TIERS } from "@/components/pricing-calculator/lib/pricing";

// Expert help: the page that sells HTS Hero Managed (PRICING.md), where the HTS Hero team joins
// the importer's company and manages every tariff on their imports. A dark hero with an example
// of the shared Slack channel, what we take on, how it starts, the price by imports managed, and
// the intro call. Savings stay potential everywhere (DESIGN_SYSTEM.md §15).

const BOOK_CALL = config.bookCallUrl;

const BookCall = ({ children = "Book an intro call" }: { children?: ReactNode }) => (
  <a
    href={BOOK_CALL}
    target="_blank"
    rel="noopener noreferrer"
    className={`${ui.button({ variant: "primary", size: "lg" })} h-12 px-6`}
  >
    {children}
    <ArrowRightIcon className="h-4 w-4" aria-hidden />
  </a>
);

const OFFER = [
  {
    Icon: UserGroupIcon,
    title: "Onboarded to your team",
    body: "We learn your products, suppliers, broker and how you buy, then load every import you bring in and every past entry into the Tracker.",
  },
  {
    Icon: ChatBubbleLeftRightIcon,
    title: "A shared Slack channel",
    body: "Message the people managing your tariffs directly. Real answers from your HTS Hero team, the same day, not a ticket queue.",
  },
  {
    Icon: VideoCameraIcon,
    title: "A weekly check-in call",
    body: "What changed, what it costs you, what we're doing about it, and the decisions we need from you. Thirty minutes, every week.",
  },
  {
    Icon: ShieldCheckIcon,
    title: "Every tariff optimized",
    body: "We review the classification, origin and programs behind every rate, and keep each import in the lowest-duty position it can claim.",
  },
  {
    Icon: LightBulbIcon,
    title: "Always hunting for savings",
    body: "Trade programs, exemptions, sourcing moves and more: we keep exploring strategies and bring you each one with what it could save.",
  },
  {
    Icon: ClipboardDocumentCheckIcon,
    title: "Every entry audited",
    body: "The duty on every entry checked against the rates in force that day, so overpayments are caught for refund and underpayments fixed early.",
  },
  {
    Icon: DocumentMagnifyingGlassIcon,
    title: "Entry summaries and delivery reports",
    body: "We review your broker's entry summaries and delivery reports as they come in, and sort out errors with your broker before they cost you.",
  },
  {
    Icon: BellAlertIcon,
    title: "Every tariff change, handled",
    body: "When a new tariff lands, you hear from us first: which imports it hits, what it costs, and the plan, before it reaches your invoices.",
  },
];

const STEPS = [
  {
    title: "Intro call",
    body: "Thirty minutes on your imports, where you stand, and whether we're the right fit.",
  },
  {
    title: "Onboarding",
    body: "We join your Slack, meet your broker, and load your products and past entries.",
  },
  {
    title: "Your first review",
    body: "A full audit of your tariffs and entries, and a savings plan ranked by what each step could save.",
  },
  {
    title: "Every week after",
    body: "Monitoring, audits, new strategies and a weekly call, on every import we manage.",
  },
];

const INCLUDED = [
  "A dedicated HTS Hero team, onboarded to your company",
  "A shared Slack channel with your team",
  "A weekly check-in call",
  "Every tariff reviewed and kept optimized",
  "Savings strategies explored continually",
  "Every entry, entry summary and delivery report audited",
  "Tariff changes explained, with a plan, as they happen",
  "The Tariff Tracker on every import we manage",
];

const TIER_NOTES = [
  "For focused importers with a core product line",
  "For growing catalogs across several countries",
  "For complex supply chains and many suppliers",
];

// An example of the shared channel, in the hero
const SlackMessage = ({ who, team, time, children }: { who: string; team?: boolean; time: string; children: ReactNode }) => (
  <div className="flex gap-3">
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${team ? "bg-primary text-primary-content" : "bg-tt-side-active text-base-content"
        }`}
      aria-hidden
    >
      {team ? "HH" : "You"}
    </span>
    <div className="flex min-w-0 flex-col gap-1">
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-bold text-base-content">{who}</span>
        <span className="text-xs text-base-content/50">{time}</span>
      </div>
      <p className="text-sm leading-relaxed text-base-content/80">{children}</p>
    </div>
  </div>
);

const ChannelPreview = () => (
  <div className="flex flex-col overflow-hidden rounded-xl border border-base-content/10 bg-tt-side-card shadow-2xl">
    <div className="flex items-center justify-between border-b border-base-content/10 px-5 py-3">
      <span className="text-sm font-bold text-base-content"># tariffs-with-hts-hero</span>
      <span className={tt.chip("neutral")}>Example</span>
    </div>
    <div className="flex flex-col gap-5 px-5 py-5">
      <SlackMessage who="HTS Hero team" team time="9:02 AM">
        Heads-up: the new Section 232 change takes effect Monday. It hits{" "}
        <span className={`${tt.numberChip("error")} whitespace-nowrap font-semibold`}>14 of your imports</span>, about{" "}
        <span className={`${tt.numberChip("error")} whitespace-nowrap font-semibold`}>+$38k a year</span> in duty. Our plan is in the thread.
      </SlackMessage>
      <SlackMessage who="Your team" time="9:15 AM">
        Thanks. Could we move the kitchenware orders to Vietnam?
      </SlackMessage>
      <SlackMessage who="HTS Hero team" team time="10:40 AM">
        We ran it: Vietnam could cut duty on those 6 imports by{" "}
        <span className={`${tt.numberChip("success")} whitespace-nowrap font-semibold`}>up to 25%</span>. Full comparison and supplier options
        for Thursday&apos;s call.
      </SlackMessage>
    </div>
  </div>
);

const SectionHeading = ({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) => (
  <div className="flex max-w-2xl flex-col gap-2">
    <span className={tt.eyebrow("primary")}>{eyebrow}</span>
    <h2 className={`${tt.display} m-0 text-3xl font-semibold tracking-tight text-base-content`}>{title}</h2>
    {body && <p className="text-base text-base-content/70">{body}</p>}
  </div>
);

export const ExpertHelp = () => {
  const pricingRef = useRef<HTMLElement>(null);
  const [billing, setBilling] = useState<Billing>("annual");
  const annualOff = `${Math.round(MANAGED_ANNUAL_DISCOUNT * 100)}% off`;
  const perMonth = (price: number) => (billing === "annual" ? Math.round(price * (1 - MANAGED_ANNUAL_DISCOUNT)) : price);
  const top = MANAGED_TIERS[MANAGED_TIERS.length - 1];

  return (
    <div className="flex flex-col gap-6">
      {/* Hero: dark in both modes, like the sidebar */}
      <section
        aria-labelledby="tt-managed-title"
        className="hts-tracker-on-dark relative overflow-hidden rounded-lg bg-tt-side text-base-content"
      >
        <div className="grid items-center gap-10 px-6 py-10 sm:px-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14 lg:px-12 lg:py-14">
          <div className="flex flex-col gap-6">
            <span className={`${tt.chip("primary")} self-start`}>HTS Hero Managed</span>
            <h1 id="tt-managed-title" className={`${tt.display} m-0 text-4xl font-semibold leading-[1.1] tracking-tight xl:text-5xl`}>
              We become your tariff team.
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-base-content/75">
              HTS Hero joins your company and manages every tariff on every import: we watch every change, keep every
              rate optimized, audit every entry and keep looking for ways to save. You talk to us in Slack, and we meet
              every week.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <BookCall />
              <button
                type="button"
                onClick={() => pricingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="inline-flex h-12 items-center rounded-full px-5 text-base font-semibold text-base-content/80 transition-colors hover:bg-tt-side-active hover:text-base-content"
              >
                See pricing
              </button>
            </div>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-base-content/70">
              {["Your own Slack channel", "A weekly call", "Every entry audited"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-success" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <ChannelPreview />
        </div>
      </section>

      {/* What we take on */}
      <section aria-labelledby="tt-managed-offer" className={`${tt.panel} ${tt.panelPad} flex flex-col gap-8`}>
        <div id="tt-managed-offer">
          <SectionHeading
            eyebrow="What we take off your plate"
            title="Your tariffs, fully managed"
            body="Everything it takes to stay in the best position on every import, done by a team that knows your products."
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {OFFER.map(({ Icon, title, body }) => (
            <div key={title} className={`${tt.tile} flex flex-col gap-3 p-5`}>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary" aria-hidden>
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="m-0 text-base font-bold text-base-content">{title}</h3>
              <p className="text-sm leading-relaxed text-base-content/70">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it starts */}
      <section aria-labelledby="tt-managed-steps" className={`${tt.panel} ${tt.panelPad} flex flex-col gap-8`}>
        <div id="tt-managed-steps">
          <SectionHeading eyebrow="How it works" title="From intro call to fully managed" />
        </div>
        <ol className="grid gap-6 md:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className={`${tt.display} flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-content`}>
                  {i + 1}
                </span>
                {i < STEPS.length - 1 && <span className="hidden h-px flex-1 bg-base-300 md:block" aria-hidden />}
              </div>
              <h3 className="m-0 text-base font-bold text-base-content">{step.title}</h3>
              <p className="text-sm leading-relaxed text-base-content/70">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Pricing */}
      <section ref={pricingRef} aria-labelledby="tt-managed-pricing" className={`${tt.panel} ${tt.panelPad} flex scroll-mt-4 flex-col gap-8`}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div id="tt-managed-pricing">
            <SectionHeading
              eyebrow="Pricing"
              title="Priced by the imports we manage"
              body="One monthly price for the whole service. An import is one HTS code from one country of origin."
            />
          </div>
          <div className="flex items-center gap-3">
            <span className={tt.chip("success")}>Save {Math.round(MANAGED_ANNUAL_DISCOUNT * 100)}% yearly</span>
            <SegmentedControl<Billing>
              label="Billing"
              options={[
                { id: "monthly", label: "Monthly" },
                { id: "annual", label: "Annual" },
              ]}
              value={billing}
              onChange={setBilling}
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {MANAGED_TIERS.map((tier, i) => (
            <div key={tier.maxPairs} className="flex flex-col gap-4 rounded-xl border border-base-300 p-6">
              <span className={tt.eyebrow("neutral")}>Up to {tier.maxPairs.toLocaleString("en-US")} imports</span>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-baseline gap-1.5">
                  <span className={tt.metricLg}>{formatPrice(perMonth(tier.price))}</span>
                  <span className="text-sm text-base-content/60">/ month</span>
                </div>
                <span className="text-xs text-base-content/60">
                  {billing === "annual" ? (
                    <>
                      <s>{formatPrice(tier.price)}</s> <span className="font-semibold text-success">{annualOff}</span>, billed yearly
                    </>
                  ) : (
                    "Billed monthly"
                  )}
                </span>
              </div>
              <p className="flex-1 text-sm text-base-content/70">{TIER_NOTES[i]}</p>
              <a href={BOOK_CALL} target="_blank" rel="noopener noreferrer" className={ui.button({ variant: "secondary" })}>
                Talk to us
              </a>
            </div>
          ))}
          <div className="flex flex-col gap-4 rounded-xl bg-primary/10 p-6">
            <span className={tt.eyebrow("primary")}>{top.maxPairs.toLocaleString("en-US")}+ imports</span>
            <div className="flex flex-col gap-1.5">
              <span className={tt.metricLg}>Custom</span>
              <span className="text-xs text-base-content/60">{billing === "annual" ? `${annualOff} yearly, too` : "Quoted for you"}</span>
            </div>
            <p className="flex-1 text-sm text-base-content/70">For large catalogs and multiple entities, priced to fit</p>
            <a href={BOOK_CALL} target="_blank" rel="noopener noreferrer" className={ui.button({ variant: "secondary" })}>
              Get a quote
            </a>
          </div>
        </div>
        <div className={`${tt.tile} flex flex-col gap-4 p-6`}>
          <span className="text-sm font-bold text-base-content">Every plan includes</span>
          <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {INCLUDED.map((item) => (
              <li key={item} className="flex gap-2.5 text-sm text-base-content/80">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-base-content/60">
          Savings depend on what your goods qualify for, and some need a process (certificates of origin, rulings or a
          supplier move) to lock in. HTS Hero finds and documents; corrections, protests and refunds are filed by your
          licensed customs broker or counsel, and we work with them directly.
        </p>
      </section>

      {/* Closing call to action */}
      <section
        aria-labelledby="tt-managed-close"
        className="hts-tracker-on-dark flex flex-col items-start gap-6 rounded-lg bg-tt-side px-6 py-10 text-base-content sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-12"
      >
        <div className="flex max-w-2xl flex-col gap-2">
          <h2 id="tt-managed-close" className={`${tt.display} m-0 text-3xl font-semibold tracking-tight`}>
            Stop drowning in tariff updates.
          </h2>
          <p className="text-base text-base-content/75">
            Book a 30-minute intro call. We&apos;ll look at your imports and tell you where you stand.
          </p>
        </div>
        <BookCall />
      </section>
    </div>
  );
};
