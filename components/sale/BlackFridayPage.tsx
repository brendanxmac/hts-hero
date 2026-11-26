"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { ArrowDownIcon, CheckIcon, ClockIcon, ShieldCheckIcon } from "@heroicons/react/20/solid";
import config from "@/config";
import { GuaranteeBox, PlanCards, type SalesPlan } from "@/components/ui/marketing/PlanPricing";
import { SectionIntro } from "@/components/ui/marketing/SectionIntro";
import * as mk from "@/components/ui/marketing/styles";
import { ALERT_TIERS, ANNUAL_DISCOUNT, AUDIT_TIERS, formatPrice } from "@/components/pricing-calculator/lib/pricing";
import { alertsIncluded } from "@/components/tariff-alerts/pricing/AlertsPricing";
import { auditsIncluded } from "@/components/tariff-audit/pricing/AuditPricing";
import { KNOWN_ACCOUNT_COOKIE, signupHref } from "@/components/tariff-tracker/access/signup";
import { startCheckout } from "@/components/tariff-tracker/plan/checkout";
import { sectionUrl } from "@/components/tariff-tracker/sections";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { SALE, saleAnnual } from "@/libs/black-friday";
import { ALERT_PLANS, AUDIT_PLANS, TRACKER_PLANS, type TrackerOffer, type TrackerPlan } from "@/libs/tariff-tracker/plan";
import { useSaleAudience } from "./useSale";

// /black-friday: the sale's own page, open to everyone. The popup, the banner and the email all
// land here (?from= or the email's utm), so nobody signs in just to see the deal. Picking a plan:
//   signed in        → Stripe checkout straight away, the coupon added by the server
//   signed out       → sign in (a known browser) or sign up, then back here with ?plan=&go=1,
//                      and checkout opens by itself (Black Friday Checkout Resumed)
//   a paying account → its plan changes in Billing (the sale is for new plans)
// Stripe's back link returns with ?canceled=<plan>. Every step is a Mixpanel event
// (MIXPANEL_TRACKING.md, "Changed on 2026-11-26").

const PAGE = "/black-friday";

const OFFERS: { id: TrackerOffer; label: string; hint: string }[] = [
  { id: "alerts", label: "Essentials", hint: "Tariff alerts" },
  { id: "audits", label: "Pro", hint: "Alerts, audits and savings" },
];

const planById = (id: string | null) => TRACKER_PLANS.find((p) => p.plan === id) ?? null;
const tierPlan = (offer: TrackerOffer, tier: SalesPlan): TrackerPlan => (offer === "alerts" ? ALERT_PLANS : AUDIT_PLANS).find((p) => p.maxPairs === tier.maxPairs)!;

// Where they came from: the popup or banner (?from=), the email (utm), another site, or typed in
const sourceOf = (params: URLSearchParams) => {
  const from = params.get("from");
  if (from) return from;
  const campaign = params.get("utm_campaign");
  if (campaign) return `${params.get("utm_source") ?? "utm"}:${campaign}`;
  try {
    const ref = document.referrer ? new URL(document.referrer).hostname : "";
    return ref && ref !== window.location.hostname ? ref : "direct";
  } catch {
    return "direct";
  }
};

// Back here after signing in or up, checkout opening by itself; this browser has had an account
// here before (proxy.ts) → the sign-in form, otherwise the sign-up form (with its own sign-in link)
const authHref = (plan: TrackerPlan) => {
  const next = `${PAGE}?plan=${encodeURIComponent(plan.plan)}&go=1`;
  const known = document.cookie.split("; ").some((c) => c.startsWith(`${KNOWN_ACCOUNT_COOKIE}=`));
  return { known, href: known ? `${config.auth.loginUrl}?redirect=${encodeURIComponent(next)}` : signupHref(next, "black_friday") };
};

const planProps = (plan: TrackerPlan) => {
  const deal = saleAnnual(plan.price);
  return { plan: plan.plan, offer: plan.offer, products: plan.maxPairs, price_usd: deal.sale, year_usd: deal.saleYear, usual_year_usd: deal.usualYear };
};

// Days, hours, minutes and seconds to the end, ticking; blank until the browser's clock is in
const useCountdown = () => {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setLeft(Math.max(0, SALE.endsAt - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  if (left === null) return null;
  const s = Math.floor(left / 1000);
  return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 };
};

const Countdown = () => {
  const c = useCountdown();
  const cells = c ? [["Days", c.days], ["Hours", c.hours], ["Min", c.minutes], ["Sec", c.seconds]] : [["Days", "–"], ["Hours", "–"], ["Min", "–"], ["Sec", "–"]];
  return (
    <div className="flex items-center gap-2 sm:gap-3" aria-label="Time left in the sale">
      {cells.map(([label, value]) => (
        <div key={label} className="flex w-16 flex-col items-center rounded-2xl bg-white/[0.08] py-2.5 ring-1 ring-white/15 sm:w-20">
          <span className="text-2xl font-bold tabular-nums text-white [font-family:var(--font-tracker-display)] sm:text-3xl">{typeof value === "number" ? String(value).padStart(2, "0") : value}</span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white/55">{label}</span>
        </div>
      ))}
    </div>
  );
};

const FAQS = [
  {
    q: "How does the discount work?",
    a: `Every annual Duty Guard plan, Essentials and Pro, any size, is ${SALE.percentOff}% off for its first year. There's no code to enter: pick a plan and the discount is applied at checkout, before you pay.`,
  },
  { q: "What happens after the first year?", a: "Your plan renews at its regular annual price. You can change or cancel it anytime before then in Billing." },
  { q: "Does it work on monthly billing?", a: `No, the sale is on annual plans only. They're already ${ANNUAL_DISCOUNT * 100}% less than monthly, and the ${SALE.percentOff}% comes off on top.` },
  { q: "When does it end?", a: `Thursday, December 3 at 11:59pm Eastern. Plans bought by then keep the ${SALE.percentOff}% for their whole first year.` },
  { q: "What's a product?", a: "One HTS code from one country of origin. Most catalogs have far fewer products than SKUs: 40 SKUs of the same screw from China is 1 product." },
  { q: "What if it isn't for me?", a: "Every plan has a 30-day money-back guarantee. Email us within 30 days of your first payment and we'll refund it in full." },
  { q: "I'm already on a plan. Can I get the sale?", a: "The sale is for new plans. Your current plan and price stay as they are; you can change it anytime in Billing." },
];

export const BlackFridayPage = ({ serverLive }: { serverLive: boolean }) => {
  const sale = useSaleAudience(serverLive);
  const [offer, setOffer] = useState<TrackerOffer>("alerts");
  const [busy, setBusy] = useState<string | null>(null);
  const [canceled, setCanceled] = useState(false);
  const source = useRef<string>("direct");
  const viewed = useRef(false);
  const resumeTried = useRef(false);
  const plansRef = useRef<HTMLElement>(null);
  const paid = sale.kind === "paid";

  // The page view, once we know who's looking; ?canceled= (back from Stripe) is read and cleared too
  useEffect(() => {
    // (An ended sale never looks up the plan: viewed straight away)
    if (viewed.current || (sale.live && sale.kind === null)) return;
    viewed.current = true;
    const params = new URLSearchParams(window.location.search);
    source.current = sourceOf(params);
    const resumed = params.get("go") === "1" && !!planById(params.get("plan"));
    trackEvent(MixpanelEvent.BLACK_FRIDAY_PAGE_VIEWED, { sale: SALE.id, source: source.current, signed_in: sale.signedIn, plan_kind: sale.kind, resumed, live: sale.live });
    const back = planById(params.get("canceled"));
    if (back) {
      setCanceled(true);
      trackEvent(MixpanelEvent.BLACK_FRIDAY_CHECKOUT_CANCELED, { sale: SALE.id, ...planProps(back) });
      window.history.replaceState(null, "", PAGE);
    }
  }, [sale.kind]); // eslint-disable-line react-hooks/exhaustive-deps

  // The plans scrolled into view, once
  useEffect(() => {
    const el = plansRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        trackEvent(MixpanelEvent.BLACK_FRIDAY_PLANS_VIEWED, { sale: SALE.id, source: source.current, signed_in: sale.signedIn });
        io.disconnect();
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [sale.signedIn]);

  const checkout = async (plan: TrackerPlan, resumed: boolean) => {
    setBusy(plan.plan);
    trackEvent(MixpanelEvent.DUTY_GUARD_CHECKOUT_STARTED, {
      plan: plan.plan,
      offer: plan.offer,
      billing: "annual",
      max_pairs: plan.maxPairs,
      price_usd: plan.price,
      plan_kind: sale.kind,
      sale: SALE.id,
      surface: "black_friday_page",
      resumed,
    });
    try {
      await startCheckout(plan, "annual", `${window.location.origin}${PAGE}?canceled=${encodeURIComponent(plan.plan)}`);
    } catch (e) {
      const error = (e as Error).message;
      trackEvent(MixpanelEvent.BLACK_FRIDAY_CHECKOUT_FAILED, { sale: SALE.id, ...planProps(plan), error, resumed });
      toast.error(error);
      setBusy(null);
    }
  };

  // Back from signing in or up with the plan they picked: straight on to checkout
  useEffect(() => {
    if (resumeTried.current || sale.kind === null) return;
    const params = new URLSearchParams(window.location.search);
    const plan = planById(params.get("plan"));
    if (params.get("go") !== "1" || !plan) return;
    resumeTried.current = true;
    // Cleared first, so Back from Stripe doesn't start it again
    window.history.replaceState(null, "", PAGE);
    if (!sale.signedIn || !sale.live) return;
    trackEvent(MixpanelEvent.BLACK_FRIDAY_CHECKOUT_RESUMED, { sale: SALE.id, ...planProps(plan), plan_kind: sale.kind });
    if (paid) {
      toast("You're already on a Duty Guard plan. Change it in Billing.");
      return;
    }
    void checkout(plan, true);
  }, [sale.kind, sale.signedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  const choose = (tier: SalesPlan) => {
    const plan = tierPlan(offer, tier);
    if (!sale.signedIn) {
      const { known, href } = authHref(plan);
      trackEvent(MixpanelEvent.BLACK_FRIDAY_PLAN_CHOSEN, { sale: SALE.id, ...planProps(plan), source: source.current, signed_in: false, plan_kind: sale.kind, next: known ? "sign_in" : "sign_up" });
      setBusy(plan.plan);
      window.location.href = href;
      return;
    }
    trackEvent(MixpanelEvent.BLACK_FRIDAY_PLAN_CHOSEN, { sale: SALE.id, ...planProps(plan), source: source.current, signed_in: true, plan_kind: sale.kind, next: paid ? "already_paid" : "checkout" });
    if (paid) {
      toast("You're already on a Duty Guard plan. Change it in Billing.");
      return;
    }
    void checkout(plan, false);
  };

  const switchOffer = (next: TrackerOffer) => {
    setOffer(next);
    trackEvent(MixpanelEvent.BLACK_FRIDAY_OFFER_SWITCHED, { sale: SALE.id, offer: next });
  };

  const toPlans = (section: string) => {
    trackEvent(MixpanelEvent.BLACK_FRIDAY_CTA_CLICKED, { sale: SALE.id, section, source: source.current, signed_in: sale.signedIn });
    plansRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const from = (tiers: readonly { price: number }[]) => saleAnnual(tiers[0].price);
  const essentials = from(ALERT_TIERS);
  const pro = from(AUDIT_TIERS);

  if (!sale.live) {
    return (
      <main className={`${mk.container} flex min-h-[60vh] flex-col items-center justify-center gap-4 py-24 text-center`}>
        <h1 className={mk.h2}>The Black Friday sale has ended</h1>
        <p className={mk.lead}>Thanks for stopping by. Duty Guard&apos;s plans are still here, with {ANNUAL_DISCOUNT * 100}% off on annual billing.</p>
        <Link href="/pricing-calculator" className={mk.buttonPrimary}>
          See plans and pricing
        </Link>
      </main>
    );
  }

  return (
    <main>
      {/* The offer */}
      <section className="hts-tracker-on-dark relative overflow-hidden bg-[linear-gradient(150deg,#0b0b12_0%,#1c1030_55%,#3a1424_100%)] text-white scheme-dark">
        <div className={`${mk.container} flex flex-col items-center gap-7 py-20 text-center sm:py-28`}>
          <span className="rounded-full bg-warning px-4 py-1.5 text-sm font-black uppercase tracking-[0.2em] text-warning-content">{SALE.name} Sale</span>
          <h1 className="m-0 text-5xl font-bold leading-[1.02] tracking-tight [font-family:var(--font-tracker-display)] sm:text-7xl">
            <span className="text-warning">{SALE.percentOff}% Off</span>
            <br />Tariff Alerts, Audits, & Savings
          </h1>
          <p className="m-0 max-w-2xl text-lg leading-relaxed text-white/75 sm:text-xl">
            Get tariff alerts, entry audits, and savings detection on all your imports. <br /> Every annual plan, Essentials and Pro, any size.
          </p>
          <Countdown />
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-base">
            <span>
              Essentials from <span className="text-white/50 line-through">{formatPrice(essentials.usual)}</span> <span className="font-bold">{formatPrice(essentials.sale)}/mo</span>
            </span>
            <span>
              Pro from <span className="text-white/50 line-through">{formatPrice(pro.usual)}</span> <span className="font-bold">{formatPrice(pro.sale)}/mo</span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => toPlans("hero")}
            className="inline-flex h-14 items-center gap-2 rounded-full bg-warning px-8 text-lg font-bold text-warning-content shadow-xl shadow-warning/25 transition-transform hover:scale-[1.03]"
          >
            Choose Your Plan <ArrowDownIcon className="h-5 w-5" aria-hidden />
          </button>
          <p className="m-0 flex items-center gap-1.5 text-sm text-white/60">
            <ShieldCheckIcon className="h-4 w-4 text-success" aria-hidden /> 30-day money-back guarantee · Ends {SALE.endsLabel} at 11:59pm ET
          </p>
        </div>
      </section>

      {/* The plans */}
      <section id="plans" ref={plansRef} className={`${mk.band} scroll-mt-6`} aria-labelledby="plans-title">
        <div className="mx-auto w-full max-w-[84rem] px-6 lg:px-8">
          <SectionIntro eyebrow="" title={`${SALE.percentOff}% off All Annual Plans`} id="plans-title" center>
            Pricing scales to fit the # of products you import. <br /> A product is 1 HTS code from 1 country of origin
          </SectionIntro>

          {canceled && (
            <p className="mx-auto mt-8 flex w-fit max-w-3xl items-center gap-2.5 rounded-full bg-warning/10 px-5 py-2.5 text-sm font-medium text-base-content ring-1 ring-warning/30">
              <ClockIcon className="h-4 w-4 shrink-0 text-warning" aria-hidden />
              Checkout closed without paying. Your {SALE.percentOff}% off is here until {SALE.endsLabel}.
            </p>
          )}
          {paid && (
            <p className="mx-auto mt-8 w-fit max-w-3xl rounded-full bg-base-content/5 px-5 py-2.5 text-center text-sm text-base-content/80">
              You&apos;re already on a Duty Guard plan, so the sale doesn&apos;t apply.{" "}
              <Link href={sectionUrl("overview")} className="font-semibold text-primary">
                Open Duty Guard
              </Link>
            </p>
          )}

          <div className="mb-10 mt-10 flex justify-center">
            {/* Essentials or Pro, big enough to see on a sales page */}
            <div className="inline-flex items-center gap-1 rounded-full bg-base-content/10 p-1.5" role="radiogroup" aria-label="Offer">
              {OFFERS.map((o) => {
                const on = offer === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => switchOffer(o.id)}
                    className={`flex flex-col items-center rounded-full px-7 py-2.5 transition-colors ${on ? "bg-primary text-primary-content shadow" : "text-base-content/70 hover:text-base-content"}`}
                  >
                    <span className="text-base font-semibold">Duty Guard {o.label}</span>
                    <span className={`text-xs ${on ? "text-primary-content/80" : "text-base-content/55"}`}>{o.hint}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <PlanCards
            product={offer === "alerts" ? "Duty Guard Essentials" : "Duty Guard Pro"}
            plans={offer === "alerts" ? ALERT_TIERS : AUDIT_TIERS}
            billing="annual"
            features={offer === "alerts" ? alertsIncluded : auditsIncluded}
            lead={(p) => (offer === "alerts" ? `Alerts on up to ${p.maxPairs} products` : `Unlimited audits on ${p.maxPairs} products`)}
            onChoose={choose}
            cta={(tier) => (busy === tierPlan(offer, tier).plan ? (sale.signedIn ? "Opening checkout…" : "One moment…") : `Claim ${SALE.percentOff}% Off`)}
            busy={busy !== null}
          />

          <GuaranteeBox title="30-day money-back guarantee" text="If Duty Guard isn't worth it, email us within 30 days of your first payment and we'll refund it in full." />
          <p className={`${mk.small} mt-6 text-center`}>
            {sale.signedIn ? "Your plan starts as soon as checkout is done." : "You'll sign in or create a free account, then go straight to checkout."} Prices in USD.
          </p>
        </div>
      </section>

      {/* Questions */}
      <section className={`${mk.band} ${mk.bandMuted}`} aria-labelledby="faq-title">
        <div className="mx-auto w-full max-w-3xl px-6">
          <h2 id="faq-title" className={`${mk.h2} text-center`}>
            Questions
          </h2>
          <div className="mt-10 flex flex-col gap-3">
            {FAQS.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl bg-white p-5 ring-1 ring-slate-200 skin:bg-base-100 skin:ring-base-300"
                onToggle={(e) => {
                  if ((e.currentTarget as HTMLDetailsElement).open) trackEvent(MixpanelEvent.BLACK_FRIDAY_FAQ_OPENED, { sale: SALE.id, question: f.q });
                }}
              >
                <summary className="cursor-pointer list-none font-semibold text-base-content [font-family:var(--font-tracker-display)]">{f.q}</summary>
                <p className="mt-3 text-base-content/75">{f.a}</p>
              </details>
            ))}
          </div>
          <div className="mt-12 flex flex-col items-center gap-3 text-center">
            <ul className="m-0 flex list-none flex-wrap justify-center gap-x-5 gap-y-1 p-0 text-sm text-base-content/70">
              {["No code needed", "Billed yearly", "Cancel anytime"].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <CheckIcon className="h-4 w-4 text-success" aria-hidden /> {t}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => toPlans("closing")}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-warning px-7 font-bold text-warning-content transition-transform hover:scale-[1.03]"
            >
              Claim {SALE.percentOff}% Off <ArrowDownIcon className="h-4 w-4 rotate-180" aria-hidden />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};
