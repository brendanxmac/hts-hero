import Link from "next/link";
import { ArrowRightIcon, CheckIcon } from "@heroicons/react/20/solid";
import { EntryCta } from "@/components/onboarding/EntryCta";
import * as cta from "@/components/ui/marketing/cta";
import * as mk from "@/components/ui/marketing/styles";
import { ALERT_TIERS, AUDIT_TIERS, formatPrice, REVERSE_TRIAL } from "../lib/pricing";
import { MAIN_CTA, PROMISES } from "./copy";

// The top of /pricing-calculator: the whole offer in one picture, a staircase rising from free to
// Duty Guard Essentials to Duty Guard Pro. Dark in both modes. CSS only, so the copy is always in the HTML.

const STEPS = [
  { name: "Duty Calculator & Tracking", price: "$0", note: "Free, no credit card required", href: "#free", height: "h-44 sm:h-52", tone: "bg-base-content/[0.06] ring-base-content/15", delay: "150ms" },
  { name: "Duty Guard Essentials", price: formatPrice(ALERT_TIERS[0].price), note: "From, per month", href: "#plans", height: "h-60 sm:h-80", tone: "bg-primary/15 ring-primary/40", delay: "300ms" },
  { name: "Duty Guard Pro", price: formatPrice(AUDIT_TIERS[0].price), note: "From, per month", href: "#plans", height: "h-76 sm:h-[27rem]", tone: "bg-primary/30 ring-primary/70 shadow-[0_0_80px_-10px] shadow-primary/50", delay: "450ms" },
];

export const SalesHero = () => (
  <header className={`relative isolate overflow-hidden ${mk.bandDark} lg:flex lg:min-h-[calc(100svh-65px)] lg:items-center`}>
    <style>{`@keyframes pricing-rise{from{transform:translateY(40px)}to{transform:none}}@media (prefers-reduced-motion:reduce){.pricing-rise{animation:none!important}}`}</style>
    {/* The light behind the stairs, and a faint grid */}
    <div className="absolute -right-40 top-1/4 -z-10 h-[36rem] w-[52rem] rounded-full bg-primary/20 blur-[120px]" aria-hidden />
    <div className="absolute -left-40 bottom-0 -z-10 h-80 w-[36rem] rounded-full bg-success/10 blur-[110px]" aria-hidden />
    <div
      className="absolute inset-0 -z-10 opacity-[0.05] bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] bg-size-[64px_64px] mask-[radial-gradient(ellipse_at_center,black,transparent_75%)]"
      aria-hidden
    />

    <div className={`${mk.container} grid grid-cols-1 items-center gap-14 pb-10 pt-8 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]`}>
      <div className="min-w-0">
        <h1>
          <span className={`${mk.display} sm:text-5xl lg:text-7xl sm:leading-[1.04]`}>
            You Only Pay to Protect your Margins. <br /> <span className="text-primary">Start Free.</span>
          </span>
        </h1>
        <p className={`${mk.lead} mt-6 max-w-xl`}>
          Every duty lookup and every product you track costs nothing. Then try Duty Guard free for {REVERSE_TRIAL.days} days on your products, and only pay if they earn it.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <EntryCta page="pricing" entry="pricing_page" section="hero" label={MAIN_CTA} className={cta.buttonPrimary}>
            {MAIN_CTA} <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </EntryCta>
          <Link href="/duty-calculator" className="text-base font-semibold text-base-content/80 underline-offset-4 hover:text-base-content hover:underline">
            Look up a duty, no account
          </Link>
        </div>
        <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
          {PROMISES.map((p) => (
            <li key={p} className={`${mk.small} flex items-center gap-1.5`}>
              <CheckIcon className="h-4 w-4 text-success" aria-hidden /> {p}
            </li>
          ))}
        </ul>
      </div>

      {/* Free, then alerts, then audits */}
      <div className="flex items-end gap-3 sm:gap-4">
        {STEPS.map((step) => (
          <a
            key={step.name}
            href={step.href}
            className={`pricing-rise group flex flex-1 flex-col justify-end rounded-3xl p-4 ring-1 transition-transform hover:-translate-y-1 sm:p-5 ${step.height} ${step.tone}`}
            style={{ animation: `pricing-rise 900ms cubic-bezier(.2,.8,.2,1) ${step.delay} both` }}
          >
            <span className="text-4xl font-semibold tracking-tight text-base-content [font-family:var(--font-tracker-display)] sm:text-5xl">{step.price}</span>
            <span className="mt-1 text-xs text-base-content/60">{step.note}</span>
            <span className="mt-3 text-sm font-semibold leading-snug text-base-content">{step.name}</span>
          </a>
        ))}
      </div>
    </div>
  </header>
);
