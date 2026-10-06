"use client";

import { MouseEvent, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "@/app/logo.svg";
import config from "@/config";
import * as ui from "@/components/ui/styles";
import { THEME } from "@/components/ui/theme";
import { SECTIONS, sectionUrl, TrackerSection } from "../sections";
import { useTracker } from "../TrackerContext";
import { useTrackerNav } from "./TrackerNav";

// The Tariff Tracker as an app: a sidebar of tabs beside the open one, filling the window. On
// narrow screens the sidebar becomes a row of tabs across the top. Tabs are real links (so they
// can be opened in a new browser tab), but a plain click switches tabs in place.

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

const SidebarTab = ({ section, count }: { section: TrackerSection; count?: number }) => {
  const { active, props } = useTabLink(section);
  const { Icon } = section;
  return (
    <a
      {...props}
      id={`tt-tab-${section.slug}`}
      className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
        active ? "bg-primary/10 text-primary" : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      <span className="flex-1 truncate">{section.label}</span>
      {count !== undefined && count > 0 && <span className="text-xs tabular-nums text-base-content/60">{count}</span>}
      {!section.ready && <span className={ui.badge()}>Soon</span>}
    </a>
  );
};

const TopTab = ({ section }: { section: TrackerSection }) => {
  const { active, props } = useTabLink(section);
  return (
    <a
      {...props}
      className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ${
        active ? "bg-primary/10 text-primary" : "text-base-content/70 hover:bg-base-200"
      }`}
    >
      {section.label}
    </a>
  );
};

export const TrackerShell = ({ children }: { children: ReactNode }) => {
  const { entries } = useTracker();
  const countFor = (section: TrackerSection) => (section.slug === "catalog" ? entries.length : undefined);

  return (
    <div className={`${THEME} flex h-svh flex-col lg:flex-row`}>
      <aside className="hidden w-60 shrink-0 flex-col border-r border-base-300 bg-base-100 lg:flex">
        <div className="flex h-14 items-center gap-2 border-b border-base-300 px-4">
          <Link href="/" className="flex shrink-0 items-center" aria-label={`${config.appName} home`}>
            <Image src={logo} alt="" className="w-6" priority width={24} height={24} />
          </Link>
          <span className="truncate text-sm font-semibold text-base-content">Tariff Tracker</span>
        </div>
        <nav
          role="tablist"
          aria-orientation="vertical"
          aria-label="Tariff Tracker"
          className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2"
        >
          {SECTIONS.map((section) => (
            <SidebarTab key={section.slug} section={section} count={countFor(section)} />
          ))}
        </nav>
      </aside>

      {/* Phones and tablets; the sidebar's tabs carry the ids the panels point to */}
      <nav
        role="tablist"
        aria-label="Tariff Tracker"
        className="flex shrink-0 gap-1 overflow-x-auto border-b border-base-300 bg-base-100 px-2 py-2 lg:hidden"
      >
        {SECTIONS.map((section) => (
          <TopTab key={section.slug} section={section} />
        ))}
      </nav>

      <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
};
