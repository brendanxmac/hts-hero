"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import logo from "@/app/logo.svg";
import config from "@/config";
import { useUser } from "@/contexts/UserContext";
import { ThemeSwitch } from "@/components/tariff-tracker/shell/ThemeSwitch";
import * as mk from "./styles";

// The site header for landing pages: light, or in the Tracker's look with a light/dark toggle on
// pages that opt in (skin:). The tariff products first, sign in or open the app on the right.
// Sticky, with a frosted background.

const NAV = [
  { href: "/duty-calculator", label: "Tariff Calculator" },
  { href: "/tariff-monitor", label: "Tariff Tracker" },
  { href: "/tariff-audit", label: "Tariff Audit" },
  { href: "/classify", label: "Classification" },
  { href: "/pricing-calculator", label: "Pricing" },
];

export const MarketingHeader = () => {
  const { user } = useUser();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Only on pages in the Tracker's look; the rest of the marketing layer is always light
  const themeSwitch = (
    <span className="hidden skin:inline-flex">
      <ThemeSwitch className="flex h-10 w-10 items-center justify-center rounded-full border border-base-300 text-base-content/70 transition-colors hover:bg-tt-soft hover:text-base-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40" />
    </span>
  );

  const actions = user ? (
    <Link href="/tariff-tracker" className={`${mk.buttonPrimary} h-10 px-4 text-sm`}>
      Open HTS Hero
    </Link>
  ) : (
    <>
      <Link href={config.auth.loginUrl} className="text-sm font-semibold text-slate-700 skin:text-base-content/80 hover:text-slate-900 skin:hover:text-base-content">
        Sign in
      </Link>
      <Link href="/duty-calculator" className={`${mk.buttonPrimary} h-10 px-4 text-sm`}>
        Calculate free
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 skin:border-base-300 bg-white/85 skin:bg-base-100/85 backdrop-blur [color-scheme:light] follow-dark:[color-scheme:dark]">
      <div className={`${mk.container} flex h-16 items-center justify-between gap-6`}>
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image src={logo} alt={`${config.appName} logo`} width={28} height={28} priority />
          <span className="text-lg font-extrabold text-slate-900 skin:text-base-content">{config.appName}</span>
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                pathname === item.href ? "bg-teal-50 skin:bg-primary/10 skin:bg-primary/10 text-teal-800 skin:text-primary skin:text-primary" : "text-slate-600 skin:text-base-content/70 hover:bg-slate-50 skin:hover:bg-tt-soft hover:text-slate-900 skin:hover:text-base-content"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-4 lg:flex">
          {themeSwitch}
          {actions}
        </div>
        <button
          type="button"
          className="rounded-lg p-2 text-slate-700 skin:text-base-content/80 hover:bg-slate-100 skin:hover:bg-tt-soft lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <nav aria-label="Main" className="border-t border-slate-200 skin:border-base-300 bg-white skin:bg-base-100 lg:hidden">
          <div className={`${mk.container} flex flex-col gap-1 py-4`}>
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2.5 font-semibold text-slate-700 skin:text-base-content/80 hover:bg-slate-50 skin:hover:bg-tt-soft" onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
            <div className="mt-3 flex items-center gap-4 border-t border-slate-200 skin:border-base-300 px-3 pt-4">
              {themeSwitch}
              {actions}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
};
