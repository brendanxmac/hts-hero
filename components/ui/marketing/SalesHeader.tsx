"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import logo from "@/app/logo.svg";
import config from "@/config";
import { useUser } from "@/contexts/UserContext";
import { useEscapeToClose } from "@/hooks";
import { ThemeSwitch } from "@/components/tariff-tracker/shell/ThemeSwitch";
import ButtonAccount from "@/components/ButtonAccount";
import * as mk from "./styles";

// The header for pages that sell one offer (/tariff-alerts, /tariff-audit): the offer's name, links
// to the page's own sections (the one in view highlighted) and its main button. Sticky, so the
// button and the pricing link are always one click away. In the Tracker's look (skin:).

export type SalesLink = { href: `#${string}`; label: string };

export const SalesHeader = ({ product, links, cta }: { product: string; links: SalesLink[]; cta: { href: string; label: string } }) => {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  useEscapeToClose(open, () => setOpen(false));

  // Every "#section" link on the page scrolls to its section, every time. Next's <Link> skips the
  // scroll when the URL already has that hash (a second "Get Alerts" click did nothing), so the
  // click is handled here first, before React's handlers
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.('a[href^="#"]');
      const id = link?.getAttribute("href")?.slice(1);
      const target = id && document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      e.stopPropagation();
      const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "start" });
      history.replaceState(null, "", `#${id}`);
      setOpen(false);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // The section in view: the last one whose top has passed the upper third of the screen
  useEffect(() => {
    const ids = links.map((l) => l.href.slice(1));
    const onScroll = () => {
      const line = window.innerHeight / 3;
      let current: string | null = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [links]);

  const themeSwitch = (
    <ThemeSwitch className="flex h-10 w-10 items-center justify-center rounded-full border border-base-300 text-base-content/70 transition-colors hover:bg-tt-soft hover:text-base-content focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40" />
  );
  const account = user ? (
    <ButtonAccount />
  ) : (
    <Link href={config.auth.loginUrl} className="text-sm font-semibold text-base-content/80 hover:text-base-content">
      Sign in
    </Link>
  );
  const button = (
    <Link
      href={cta.href}
      className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-full bg-primary px-5 text-sm font-semibold text-primary-content transition-colors hover:bg-primary/90"
    >
      {cta.label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-base-300 bg-base-100/85 backdrop-blur-sm scheme-light follow-dark:scheme-dark">
      {/* Section links land below the header, not under it */}
      <style>{`html { scroll-padding-top: 5rem; }`}</style>
      <div className={`${mk.container} flex h-16 items-center justify-between gap-6`}>
        <div className="flex shrink-0 items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Image src={logo} alt={`${config.appName} logo`} width={28} height={28} priority />
            <span className="text-lg font-extrabold text-base-content">{config.appName}</span>
          </Link>
          <span className="hidden h-5 w-px bg-base-300 sm:block" aria-hidden />
          <a href="#top" className="hidden text-sm font-semibold text-base-content/70 hover:text-base-content sm:block">
            {product}
          </a>
        </div>
        <nav aria-label="On this page" className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                active === l.href.slice(1) ? "bg-primary/10 text-primary" : "text-base-content/70 hover:bg-tt-soft hover:text-base-content"
              }`}
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-4 whitespace-nowrap lg:flex">
          {themeSwitch}
          {account}
          {button}
        </div>
        <button
          type="button"
          className="rounded-lg p-2 text-base-content/80 hover:bg-tt-soft lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <nav aria-label="On this page" className="border-t border-base-300 bg-base-100 lg:hidden">
          <div className={`${mk.container} flex flex-col gap-1 py-4`}>
            {links.map((l) => (
              <a key={l.href} href={l.href} className="rounded-lg px-3 py-2.5 font-semibold text-base-content/80 hover:bg-tt-soft" onClick={() => setOpen(false)}>
                {l.label}
              </a>
            ))}
            <div className="mt-3 flex items-center gap-4 border-t border-base-300 px-3 pt-4">
              {themeSwitch}
              {account}
              <span className="ml-auto">{button}</span>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
};
