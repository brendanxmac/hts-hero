"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalculatorIcon, BellAlertIcon, SparklesIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { REVERSE_TRIAL } from "@/components/pricing-calculator/lib/pricing";
import * as mk from "@/components/ui/marketing/styles";

// A new account that signed up from a generic link lands on the home page (SIGNUP_HOME,
// "/?welcome=1"): a welcome, and the three things the account opens, each one click away. Read
// from the address after load, so the page stays static; the flag is dropped once shown.

const PRODUCTS = [
  {
    Icon: CalculatorIcon,
    title: "Duty Calculator",
    note: "Free and unlimited, with duty over time and analysis unlocked",
    href: "/duty-calculator",
    cta: "Calculate duty",
  },
  {
    Icon: BellAlertIcon,
    title: "Tariff Tracker",
    note: `Alerts the day a tariff change hits your imports. ${REVERSE_TRIAL.days} days free from your first imports`,
    href: "/tariff-tracker",
    cta: "Add my imports",
  },
  {
    Icon: SparklesIcon,
    title: "Classify Assistant",
    note: "The right HTS code for a product, with the reasoning to back it up",
    href: "/classify#try-classify",
    cta: "Classify a product",
  },
] as const;

export const WelcomeNotice = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("welcome") !== "1") return;
    setShow(true);
    url.searchParams.delete("welcome");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  }, []);
  if (!show) return null;

  return (
    <section aria-label="Welcome to HTS Hero" className="tt-enter border-b border-slate-200 bg-slate-50 py-6 skin:border-base-300 skin:bg-tt-soft">
      <div className={`${mk.container} flex flex-col gap-4`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={mk.eyebrow}>Your account is ready</p>
            <h2 className={`${mk.h3} mt-1`}>Welcome to HTS Hero. Here&apos;s what you can do now.</h2>
          </div>
          <button type="button" onClick={() => setShow(false)} className="rounded-full p-1.5 text-slate-500 hover:bg-slate-200 skin:text-base-content/60 skin:hover:bg-base-300" aria-label="Close">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {PRODUCTS.map(({ Icon, title, note, href, cta }) => (
            <Link key={title} href={href} className={`${mk.card} group flex items-start gap-3 p-4 transition-colors hover:border-slate-300 skin:hover:border-primary/40`}>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 skin:bg-primary/10 skin:text-primary" aria-hidden>
                <Icon className="h-5 w-5" />
              </span>
              <span className="flex flex-col gap-1">
                <span className="font-semibold text-slate-900 skin:text-base-content">{title}</span>
                <span className={mk.small}>{note}</span>
                <span className="mt-1 text-sm font-semibold text-teal-700 group-hover:underline skin:text-primary">{cta} →</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
