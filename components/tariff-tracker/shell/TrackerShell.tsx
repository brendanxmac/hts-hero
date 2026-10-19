"use client";

import { MouseEvent, ReactNode, useEffect, useState } from "react";
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon, LockClosedIcon } from "@heroicons/react/20/solid";
import Image from "next/image";
import Link from "next/link";
import logo from "@/app/logo.svg";
import config from "@/config";
import { trackerSans } from "@/components/ui/font";
import * as tt from "@/components/ui/styles/tracker";
import { THEME } from "@/components/ui/theme";
import { useTrackerAccess } from "../access/accessContext";
import { AccountMenu, PlanBanner, PlanCard } from "../plan";
import { TrialDialog } from "../plan/trial";
import { SECTIONS, sectionUrl, TrackerSection } from "../sections";
import { ThemeSwitch } from "./ThemeSwitch";
import { NavMeta, useNavMeta } from "./useNavMeta";
import { useTrackerNav } from "./TrackerNav";

// The Tariff Tracker as an app (DESIGN_SYSTEM.md §15): a floating sidebar, dark in both modes,
// beside the open section. Each tab's dot and count say what's waiting there (free checks left,
// on the trial); paid-only tabs carry a lock until a plan unlocks them, and still open onto what
// they'd show.
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

// One style for every count (DESIGN_SYSTEM.md §15 "Sidebar"): a small pill, neutral for a count,
// cobalt for something new, green for money, amber for what needs a look
const META_TEXT: Record<NavMeta["tone"], string> = {
  error: "bg-error/15 text-error",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  primary: "bg-primary/20 text-primary",
  neutral: "bg-tt-side-active text-base-content/70",
};

const SidebarTab = ({ section, meta, locked, collapsed }: { section: TrackerSection; meta?: NavMeta; locked: boolean; collapsed: boolean }) => {
  const { active, props } = useTabLink(section);
  // Collapsed: the section's icon alone, its name as the tooltip, and its dot when something waits
  if (collapsed)
    return (
      <a
        {...props}
        id={`tt-tab-${section.slug}`}
        title={section.comingSoon ? `${section.label} · Coming soon` : meta ? `${section.label} · ${meta.text}` : section.label}
        aria-label={section.label}
        className={`relative flex h-10 w-10 items-center justify-center self-center rounded-xl transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40 ${
          active ? "bg-tt-side-active text-base-content" : "text-base-content/70 hover:bg-tt-side-active hover:text-base-content"
        } ${section.ready ? "" : "opacity-60"}`}
      >
        <section.Icon className="h-5 w-5" aria-hidden />
        {!section.comingSoon && meta && meta.tone !== "neutral" && <span className={`absolute right-1.5 top-1.5 h-2 w-2 rounded-full ${DOTS[meta.tone]}`} aria-hidden />}
      </a>
    );
  return (
    <a
      {...props}
      id={`tt-tab-${section.slug}`}
      className={`flex h-10 items-center gap-3 rounded-xl px-3 text-sm transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40 ${active ? "bg-tt-side-active font-semibold text-base-content" : "font-medium text-base-content/70 hover:bg-tt-side-active hover:text-base-content"
        } ${section.ready ? "" : "opacity-60"}`}
    >
      {/* The section's icon, as in the collapsed sidebar; what's waiting shows on the right */}
      <section.Icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-base-content" : "text-base-content/60"}`} aria-hidden />
      <span className="flex-1 truncate">{section.label}</span>
      {section.comingSoon ? (
        <span className="rounded-full bg-tt-side-active px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-base-content/60">Soon</span>
      ) : locked ? (
        <LockClosedIcon className="h-3.5 w-3.5 text-base-content/60" aria-label="Paid plans" />
      ) : (
        meta && <span className={`rounded-full px-2 py-0.5 text-[0.7rem] font-semibold tabular-nums ${META_TEXT[meta.tone]}`}>{meta.text}</span>
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

const GROUPS = [{ label: "Workspace", id: "workspace" }] as const;

// The sections in the sidebar (some are left out for now: sections.ts)
const SHOWN = SECTIONS.filter((s) => !s.hidden);

// While the app is open the page itself never scrolls: only the section does. Anything added to
// the page outside the app (tooltips, chat) can't stretch it.
const useLockPageScroll = () => {
  useEffect(() => {
    const targets = [document.documentElement, document.body];
    targets.forEach((el) => el.classList.add("overflow-hidden"));
    return () => targets.forEach((el) => el.classList.remove("overflow-hidden"));
  }, []);
};

// The sidebar folds down to its icons, for more room; remembered on this device
const COLLAPSED_KEY = "hts-hero-tariff-tracker-sidebar-collapsed";

export const TrackerShell = ({ children }: { children: ReactNode }) => {
  useLockPageScroll();
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(COLLAPSED_KEY) === "1");
    } catch {
      // Not critical
    }
  }, []);
  const toggleCollapsed = () =>
    setCollapsed((was) => {
      try {
        window.localStorage.setItem(COLLAPSED_KEY, was ? "0" : "1");
      } catch {
        // Not critical
      }
      return !was;
    });
  const { paid, loading } = useTrackerAccess();
  const meta = useNavMeta();

  return (
    // Exactly the screen's height, and the box everything inside is positioned in (relative,
    // overflow hidden): an absolutely positioned dropdown, popover or screen-reader label far down
    // a scrolled section would otherwise be placed against the page and stretch it past the app
    <div className={`${THEME} hts-tracker ${trackerSans.className} relative flex h-svh flex-col overflow-hidden bg-base-200 lg:flex-row lg:gap-4 lg:p-4`}>
      <aside
        className={`hts-tracker-on-dark relative hidden shrink-0 flex-col gap-5 rounded-lg bg-tt-side text-base-content transition-[width] lg:flex ${collapsed ? "w-18 px-2 py-4" : "w-64 p-4"}`}
      >
        <div className={`flex items-center gap-2.5 pt-1 ${collapsed ? "flex-col" : "px-2"}`}>
          <Link href="/" className="flex shrink-0 items-center rounded-full bg-base-content p-1" aria-label={`${config.appName} home`}>
            <Image src={logo} alt="" className="w-6" priority width={24} height={24} />
          </Link>
          {!collapsed && (
            <div className="flex min-w-0 flex-1 flex-col">
              <span className={`${tt.display} truncate text-[0.95rem] font-semibold`}>Tariff Tracker</span>
              <span className="truncate text-xs text-base-content/60">{config.appName}</span>
            </div>
          )}
          <button
            type="button"
            onClick={toggleCollapsed}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base-content/60 transition-colors hover:bg-tt-side-active hover:text-base-content"
            aria-label={collapsed ? "Expand the menu" : "Collapse the menu"}
            title={collapsed ? "Expand the menu" : "Collapse the menu"}
          >
            {collapsed ? <ChevronDoubleRightIcon className="h-4 w-4" aria-hidden /> : <ChevronDoubleLeftIcon className="h-4 w-4" aria-hidden />}
          </button>
        </div>
        <nav role="tablist" aria-orientation="vertical" aria-label="Tariff Tracker" className="relative flex flex-1 flex-col gap-4 overflow-y-auto">
          {GROUPS.map((group) => (
            <div key={group.label} className="flex flex-col gap-1">
              {collapsed ? (
                <span className="mx-auto mb-1 h-px w-6 bg-base-content/20" aria-hidden />
              ) : (
                <span className="px-3 pb-1 text-[0.7rem] font-bold uppercase tracking-wider text-base-content/60">{group.label}</span>
              )}
              {SHOWN.filter((s) => s.group === group.id).map((section) => (
                <SidebarTab key={section.slug} section={section} meta={meta[section.slug]} locked={section.paidOnly && section.ready && !paid && !loading} collapsed={collapsed} />
              ))}
            </div>
          ))}
          {/* Help sits apart from the daily work, above the plan */}
          <div className="mt-auto flex flex-col gap-1">
            {SHOWN.filter((s) => s.group === "foot").map((section) => (
              <SidebarTab key={section.slug} section={section} meta={meta[section.slug]} locked={false} collapsed={collapsed} />
            ))}
          </div>
        </nav>
        {!collapsed && <PlanCard />}
        <div className={`flex items-center gap-1 ${collapsed ? "flex-col" : ""}`}>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <AccountMenu />
            </div>
          )}
          <ThemeSwitch />
        </div>
      </aside>

      {/* Phones and tablets; the sidebar's tabs carry the ids the panels point to */}
      <nav role="tablist" aria-label="Tariff Tracker" className="flex shrink-0 gap-1 overflow-x-auto border-b border-base-300 bg-base-100 px-2 py-2 lg:hidden">
        {SHOWN.map((section) => (
          <TopTab key={section.slug} section={section} />
        ))}
      </nav>

      {/* The one scroller: positioned, so what's absolutely positioned inside scrolls (and is
          clipped) with it */}
      <main className="relative min-h-0 min-w-0 flex-1 overflow-y-auto">
        <div className="px-4 pt-4 empty:hidden sm:px-6 lg:px-2 lg:pt-0">
          <PlanBanner />
          <TrialDialog />
        </div>
        {children}
      </main>
    </div>
  );
};
