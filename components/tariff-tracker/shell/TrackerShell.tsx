"use client";

import { MouseEvent, ReactNode } from "react";
import { LockClosedIcon } from "@heroicons/react/20/solid";
import Image from "next/image";
import Link from "next/link";
import logo from "@/app/logo.svg";
import config from "@/config";
import { trackerSans } from "@/components/ui/font";
import * as tt from "@/components/ui/styles/tracker";
import { THEME } from "@/components/ui/theme";
import { useTrackerAccess } from "../access/accessContext";
import { AccountMenu, PlanBanner, PlanCard } from "../plan";
import { SECTIONS, sectionUrl, TrackerSection } from "../sections";
import { ThemeSwitch } from "./ThemeSwitch";
import { NavMeta, useNavMeta } from "./useNavMeta";
import { useTrackerNav } from "./TrackerNav";

// The Tariff Tracker as an app (DESIGN_SYSTEM.md §15): a floating sidebar, dark in both modes,
// beside the open section. Each tab's dot and count say what's waiting there; premium tabs
// carry a lock until the trial or a plan unlocks them, and still open onto what they'd show.
// The plan, the account and light/dark sit at its foot. On narrow screens the sidebar becomes a
// row of tabs across the top. Tabs are real links, but a plain click switches tabs in place.

const useTabLink = (section: TrackerSection) => {
  const { tab, openTab } = useTrackerNav();
  const active = section.slug === tab;
  return {
    active,
    props: {
      href: sectionUrl(section.slug),
      role: "tab",
      "aria-selected": active,
      "aria-controls": `tt-panel-${section.slug}`,
      onClick: (e: MouseEvent<HTMLAnchorElement>) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        openTab(section.slug);
      },
    },
  };
};

const DOTS: Record<NavMeta["tone"], string> = {
  error: "bg-error",
  success: "bg-success",
  warning: "bg-warning",
  primary: "bg-primary",
  neutral: "bg-base-content/25",
};

const META_TEXT: Record<NavMeta["tone"], string> = {
  error: "text-error",
  success: "text-success",
  warning: "text-warning",
  primary: "text-primary",
  neutral: "text-base-content/60",
};

const SidebarTab = ({ section, meta, locked }: { section: TrackerSection; meta?: NavMeta; locked: boolean }) => {
  const { active, props } = useTabLink(section);
  return (
    <a
      {...props}
      id={`tt-tab-${section.slug}`}
      className={`flex h-10 items-center gap-3 rounded-xl px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
        active ? "bg-tt-side-active font-semibold text-base-content" : "font-medium text-base-content/70 hover:bg-tt-side-active hover:text-base-content"
      } ${section.ready ? "" : "opacity-60"}`}
    >
      <span className={`h-2 w-2 shrink-0 rounded-full ${active ? "bg-success" : meta && meta.tone !== "neutral" ? DOTS[meta.tone] : "bg-base-content/25"}`} aria-hidden />
      <span className="flex-1 truncate">{section.label}</span>
      {locked ? (
        <LockClosedIcon className="h-3.5 w-3.5 text-base-content/60" aria-label="Premium" />
      ) : (
        meta && <span className={`text-xs font-semibold ${META_TEXT[meta.tone]}`}>{meta.text}</span>
      )}
    </a>
  );
};

const TopTab = ({ section }: { section: TrackerSection }) => {
  const { active, props } = useTabLink(section);
  return (
    <a
      {...props}
      className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium ${active ? "bg-base-content text-base-100" : "text-base-content/70 hover:bg-tt-soft"}`}
    >
      {section.label}
    </a>
  );
};

const GROUPS = [
  { label: "Workspace", premium: false },
  { label: "Intelligence", premium: true },
];

export const TrackerShell = ({ children }: { children: ReactNode }) => {
  const { premium, loading } = useTrackerAccess();
  const meta = useNavMeta();

  return (
    <div className={`${THEME} hts-tracker ${trackerSans.className} flex h-svh flex-col bg-base-200 lg:flex-row lg:gap-4 lg:p-4`}>
      <aside className="hts-tracker-on-dark hidden w-64 shrink-0 flex-col gap-5 rounded-3xl bg-tt-side p-4 text-base-content lg:flex">
        <div className="flex items-center gap-2.5 px-2 pt-1">
          <Link href="/" className="flex shrink-0 items-center rounded-full bg-base-content p-1" aria-label={`${config.appName} home`}>
            <Image src={logo} alt="" className="w-6" priority width={24} height={24} />
          </Link>
          <div className="flex min-w-0 flex-col">
            <span className={`${tt.display} truncate text-[0.95rem] font-semibold`}>Tariff Tracker</span>
            <span className="truncate text-xs text-base-content/60">{config.appName}</span>
          </div>
        </div>
        <nav role="tablist" aria-orientation="vertical" aria-label="Tariff Tracker" className="flex flex-1 flex-col gap-4 overflow-y-auto">
          {GROUPS.map((group) => (
            <div key={group.label} className="flex flex-col gap-1">
              <span className="px-3 pb-1 text-[0.7rem] font-bold uppercase tracking-wider text-base-content/60">{group.label}</span>
              {SECTIONS.filter((s) => s.premium === group.premium).map((section) => (
                <SidebarTab key={section.slug} section={section} meta={meta[section.slug]} locked={section.premium && section.ready && !premium && !loading} />
              ))}
            </div>
          ))}
        </nav>
        <PlanCard />
        <div className="flex items-center gap-1">
          <div className="min-w-0 flex-1">
            <AccountMenu />
          </div>
          <ThemeSwitch />
        </div>
      </aside>

      {/* Phones and tablets; the sidebar's tabs carry the ids the panels point to */}
      <nav role="tablist" aria-label="Tariff Tracker" className="flex shrink-0 gap-1 overflow-x-auto border-b border-base-300 bg-base-100 px-2 py-2 lg:hidden">
        {SECTIONS.map((section) => (
          <TopTab key={section.slug} section={section} />
        ))}
      </nav>

      <main className="min-w-0 flex-1 overflow-y-auto lg:rounded-3xl">
        <div className="px-4 pt-4 empty:hidden sm:px-6 lg:px-2 lg:pt-0">
          <PlanBanner />
        </div>
        {children}
      </main>
    </div>
  );
};
