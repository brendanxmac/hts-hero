"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRightIcon, CheckIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import config from "@/config";
import { mono } from "@/components/ui/font";
import { BillingSwitch, SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import {
  Billing,
  CLASSIFY_PLANS,
  FREE_TRACKED_PAIRS,
  TRACKER_MAX_LISTED_PAIRS,
  TRACKER_TIERS,
  TRIAL_DAYS,
  formatPrice,
  monthlyRate,
} from "@/components/pricing-calculator/lib/pricing";

// Pricing at a glance: what's free, and the Tariff Tracker priced by catalog size, with a
// tier picker and the annual discount. Below the cards, a worked example of how a catalog is counted
// (one product per HTS code + country of origin), then classification as its own line. Every number
// comes from the price list (PRICING.md).

const FREE_INCLUDES = [
  "Tariff Calculator: unlimited lookups, no account",
  `Tariff Tracker for ${FREE_TRACKED_PAIRS} products, with alerts`,
  "A free one-time overpayment check of your entries",
  "Works in AI assistants over MCP",
];

const TRACKER_INCLUDES = [
  "Alerts by email, in-app, Slack and Teams",
  "Rate history for every product",
  "Entry audit: overpaid and underpaid duty",
  "Savings from other origins and programs",
  "CSV catalog upload and team reports",
];

type Tier = { label: string; pairs: number | null; price: number | null };
const TIERS: Tier[] = [
  ...TRACKER_TIERS.map((t) => ({ label: `${t.maxPairs}`, pairs: t.maxPairs, price: t.price })),
  { label: `${TRACKER_MAX_LISTED_PAIRS}+`, pairs: null, price: null },
];

const Includes = ({ items, dark }: { items: string[]; dark?: boolean }) => (
  <ul className="flex flex-col gap-3.5">
    {items.map((i) => (
      <li key={i} className={`flex gap-3 text-base ${dark ? "text-slate-200" : "text-slate-700"}`}>
        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${dark ? "bg-teal-400/20" : "bg-teal-50 ring-1 ring-teal-200"}`}>
          <CheckIcon className={`h-3.5 w-3.5 ${dark ? "text-teal-300" : "text-teal-600"}`} aria-hidden />
        </span>
        {i}
      </li>
    ))}
  </ul>
);

// A small upload, counted: four shipments, three products
const EXAMPLE_UPLOAD = [
  { code: "6109.10.00", product: "Cotton T-shirts", origin: "China", shipped: "Jan 14", counts: "1" },
  { code: "6109.10.00", product: "Cotton T-shirts", origin: "Vietnam", shipped: "Feb 3", counts: "2" },
  { code: "6109.10.00", product: "Cotton T-shirts", origin: "China", shipped: "Mar 9", counts: null },
  { code: "9401.61.60", product: "Wood chairs", origin: "Mexico", shipped: "Mar 22", counts: "3" },
];

const HowProductsCount = () => (
  <div
    id="how-products-count"
    className="mx-auto mt-6 grid max-w-6xl scroll-mt-24 grid-cols-1 gap-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center"
  >
    <div>
      <p className={mk.eyebrow}>How we count products</p>
      <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">One product = one HTS code from one country of origin</h3>
      <p className="mt-3 text-slate-600">
        Upload your product catalog or your import history as a CSV. We group it by HTS code and country of origin, and each
        pair counts as one product.
      </p>
      <p className="mt-3 text-slate-600">
        Repeat shipments, quantities and values don&apos;t add to your count. The same code from a second country does.
      </p>
    </div>

    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm sm:min-w-[26rem]">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-2.5 font-semibold">HTS code</th>
              <th className="px-3 py-2.5 font-semibold">Origin</th>
              <th className="hidden px-3 py-2.5 font-semibold sm:table-cell">Shipped</th>
              <th className="px-4 py-2.5 text-right font-semibold">Counts as</th>
            </tr>
          </thead>
          <tbody>
            {EXAMPLE_UPLOAD.map((r) => (
              <tr key={`${r.code}-${r.origin}-${r.shipped}`} className={`border-t border-slate-100 ${r.counts ? "" : "text-slate-400"}`}>
                <td className="px-4 py-3">
                  <span className={`${mono.className} block text-xs ${r.counts ? "text-slate-900" : ""}`}>{r.code}</span>
                  <span className="text-xs">{r.product}</span>
                </td>
                <td className={`px-3 py-3 ${r.counts ? "font-medium text-slate-900" : ""}`}>{r.origin}</td>
                <td className="hidden px-3 py-3 sm:table-cell">{r.shipped}</td>
                <td className="px-4 py-3 text-right">
                  {r.counts ? (
                    <span className="inline-flex items-center gap-1.5 font-semibold text-teal-700">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-50 text-xs ring-1 ring-teal-200">{r.counts}</span>
                      <span className="hidden sm:inline">product</span>
                    </span>
                  ) : (
                    <span className="text-xs font-medium">Already counted</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm">
        <span className="text-slate-600">{EXAMPLE_UPLOAD.length} shipments uploaded</span>
        <span className="font-bold text-slate-900">= {new Set(EXAMPLE_UPLOAD.map((r) => `${r.code}|${r.origin}`)).size} products tracked</span>
      </p>
    </div>
  </div>
);

export const PricingOverview = () => {
  const [billing, setBilling] = useState<Billing>("monthly");
  const [tier, setTier] = useState<Tier>(TIERS[0]);
  const price = tier.price === null ? null : monthlyRate(tier.price, billing);

  return (
    <section id="pricing" className={`${mk.band} ${mk.bandMuted} scroll-mt-20`} aria-labelledby="home-pricing-title">
      <div className={mk.container}>
        <div className="flex flex-col items-center gap-8">
          <SectionIntro eyebrow="Pricing" title="Pricing that matches your imports" id="home-pricing-title" center>
            No demo, no sales call and no contract. Try {TRIAL_DAYS} days free.
          </SectionIntro>
          <BillingSwitch billing={billing} onChange={setBilling} />
        </div>

        <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          {/* Free */}
          <article className="flex flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10" aria-labelledby="price-free-title">
            <h3 id="price-free-title" className="text-2xl font-bold text-slate-900">
              Free
            </h3>
            <p className="mt-1 text-slate-600">Everything you need to look up a tariff, today.</p>
            <p className="mt-8 flex items-baseline gap-2">
              <span className="text-7xl font-extrabold tracking-tight text-slate-900">$0</span>
            </p>
            <div className="mt-8 flex-1 border-t border-slate-100 pt-8">
              <Includes items={FREE_INCLUDES} />
            </div>
            <Link href="/duty-calculator" className={`${mk.buttonSecondary} mt-10 h-14 w-full text-lg`}>
              Calculate a duty free
            </Link>
          </article>

          {/* Tariff Tracker */}
          <article className="relative flex flex-col overflow-hidden rounded-3xl bg-slate-900 p-8 text-white shadow-2xl shadow-slate-900/25 sm:p-10" aria-labelledby="price-tracker-title">
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(36rem_18rem_at_100%_0%,rgba(45,212,191,0.25),transparent)]" />
            <div className="relative flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 id="price-tracker-title" className="text-2xl font-bold">
                  Tariff Tracker
                </h3>
                <p className="mt-1 text-slate-300">Your whole catalog watched, audited and optimized.</p>
              </div>
              <span className="rounded-full bg-teal-400 px-3.5 py-1.5 text-sm font-bold text-slate-950">{TRIAL_DAYS}-day free trial</span>
            </div>

            <div className="relative mt-8 grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div>
                <p className="flex items-baseline gap-2" aria-live="polite">
                  {price === null ? (
                    <span className="text-6xl font-extrabold tracking-tight">Let&apos;s talk</span>
                  ) : (
                    <>
                      <span className="text-7xl font-extrabold tracking-tight">{formatPrice(price)}</span>
                      <span className="text-lg text-slate-400">/mo</span>
                    </>
                  )}
                </p>
                {billing === "monthly" && tier.price !== null && (
                  <button
                    type="button"
                    onClick={() => setBilling("annual")}
                    className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-3 py-1.5 text-sm font-semibold text-emerald-300 ring-1 ring-emerald-400/30 transition-colors hover:bg-emerald-400/25"
                  >
                    Save {formatPrice((tier.price - monthlyRate(tier.price, "annual")) * 12)}/yr with annual billing
                  </button>
                )}
                <p className="mt-2 text-sm text-slate-400">
                  {tier.pairs === null
                    ? `Over ${TRACKER_MAX_LISTED_PAIRS} products, priced to your catalog`
                    : `Up to ${tier.pairs} products${billing === "annual" && price !== null ? ` · ${formatPrice(price * 12)} billed yearly` : ""}`}
                </p>

                <p className="mt-8 text-xs font-bold uppercase tracking-wider text-slate-400">Products you track</p>
                <div className="mt-3 grid grid-cols-4 gap-1.5 rounded-2xl bg-white/5 p-1.5 ring-1 ring-white/10" role="radiogroup" aria-label="Products to track">
                  {TIERS.map((t) => {
                    const active = t.label === tier.label;
                    return (
                      <button
                        key={t.label}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setTier(t)}
                        className={`rounded-xl px-2 py-3 text-center transition-colors ${active ? "bg-white text-slate-900" : "text-slate-300 hover:bg-white/10"}`}
                      >
                        <span className="block text-lg font-bold tabular-nums">{t.label}</span>
                        {/* <span className={`block text-xs ${active ? "text-slate-500" : "text-slate-400"}`}>
                          {t.price === null ? "custom" : `${formatPrice(monthlyRate(t.price, billing))}/mo`}
                        </span> */}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 text-sm text-slate-400">
                  1 product = 1 HTS code from 1 country of origin.{" "}
                  <a href="#how-products-count" className="font-semibold text-teal-300 underline-offset-4 hover:underline">
                    How we count
                  </a>
                </p>
              </div>
              <Includes items={TRACKER_INCLUDES} dark />
            </div>

            <div className="relative mt-10 flex flex-wrap items-center gap-5">
              {tier.pairs === null ? (
                <a href={`mailto:${config.resend.supportEmail}?subject=${encodeURIComponent("Tariff Tracker for a large catalog")}`} className={`${mk.buttonOnDark} h-14 px-8 text-lg`}>
                  Talk to us <ArrowRightIcon className="h-5 w-5" aria-hidden />
                </a>
              ) : (
                <Link href={config.auth.loginUrl} className={`${mk.buttonOnDark} h-14 px-8 text-lg`}>
                  Start your free trial <ArrowRightIcon className="h-5 w-5" aria-hidden />
                </Link>
              )}
              {/* <span className="text-sm text-slate-400">No credit card. Free for {FREE_TRACKED_PAIRS} products after the trial.</span> */}
            </div>
          </article>
        </div>

        <HowProductsCount />

        <Link
          href="/classify#pricing"
          className="group mx-auto mt-6 flex max-w-6xl flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 transition-colors hover:border-teal-300 sm:flex-row sm:items-center sm:justify-between sm:px-10"
        >
          <span className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <MagnifyingGlassIcon className="h-6 w-6" aria-hidden />
            </span>
            <span>
              <span className="block text-lg font-bold text-slate-900">Classification assistant</span>
              <span className="text-slate-600">Audit-ready HTS classifications, backed by legal notes and CROSS rulings</span>
            </span>
          </span>
          <span className="flex items-center gap-4">
            <span className="text-2xl font-extrabold text-slate-900">
              From {formatPrice(monthlyRate(CLASSIFY_PLANS.starter.price, billing))}
              <span className="text-base font-medium text-slate-500">/mo</span>
            </span>
            <ArrowRightIcon className="h-5 w-5 text-teal-700 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </span>
        </Link>

        <p className="mt-8 text-center">
          <Link href="/pricing-calculator" className={mk.link}>
            See every plan and estimate your price
          </Link>
        </p>
      </div>
    </section>
  );
};
