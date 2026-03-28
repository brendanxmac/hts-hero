"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import config from "@/config";
import logo from "@/app/logo.svg";
import { ClassificationI } from "../../interfaces/hts";
import { ClassificationNavItem, NavTab } from "./useClassificationNav";
import { UserProfile } from "../../libs/supabase/user";
import ThemeToggle from "../ThemeToggle";
import ButtonAccount from "../ButtonAccount";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  LockClosedIcon,
} from "@heroicons/react/16/solid";
import {
  EyeIcon,
  ScaleIcon,
  CurrencyDollarIcon,
  PaperClipIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { useIsReadOnly } from "../../contexts/ReadOnlyContext";
import { MixpanelEvent, trackEvent } from "../../libs/mixpanel";

interface Props {
  classification: ClassificationI;
  classificationId?: string;
  navItems: ClassificationNavItem[];
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onNavigateBack: () => void;
  userProfile: UserProfile | null;
  isAnonymous: boolean;
  useNormalWorkspace: boolean;
}

function StatusDot({ status }: { status: ClassificationNavItem["status"] }) {
  switch (status) {
    case "completed":
      return <CheckCircleIcon className="w-3.5 h-3.5 text-success shrink-0" />;
    case "active":
      return (
        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
      );
    case "pending":
      return (
        <span className="w-2 h-2 rounded-full border border-base-content/20 shrink-0" />
      );
    default:
      return null;
  }
}

const NAV_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  overview: EyeIcon,
  "cross-rulings": ScaleIcon,
  "duty-tariffs": CurrencyDollarIcon,
  attachments: PaperClipIcon,
  "classification-report": DocumentTextIcon,
};

export const MobileNavDropdown = ({
  classification,
  classificationId,
  navItems,
  activeTab,
  onTabChange,
  onNavigateBack,
  userProfile,
  isAnonymous,
  useNormalWorkspace: useNormalWorkspace,
}: Props) => {
  const readOnly = useIsReadOnly();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeItem = navItems.find((item) => item.id === activeTab);
  const activeHasSelection =
    activeItem?.status === "completed" &&
    (activeItem.htsno || activeItem.selectionDescription);
  const activeLabel = activeHasSelection
    ? activeItem.htsno || activeItem.selectionDescription
    : activeItem?.label || "Overview";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (tab: NavTab) => {
    trackEvent(MixpanelEvent.CLASSIFICATION_TAB_SELECTED, {
      tab_id: tab,
      nav_source: "mobile",
      classification_id: classificationId,
    });
    onTabChange(tab);
    setIsOpen(false);
  };

  const mainItems = navItems.filter((item) => !item.isSubItem);
  const classificationSubItems = navItems.filter((item) => item.isSubItem);

  return (
    <div className="sticky top-0 z-40 bg-base-100 border-b border-base-300">
      <div className="flex items-center justify-between px-3 py-2 gap-2">
        {/* Left: Logo + Back */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/" className="flex items-center">
            <Image
              src={logo}
              alt={`${config.appName} logo`}
              className="w-5"
              priority
              width={24}
              height={24}
            />
          </Link>
          {useNormalWorkspace && (
            <button
              onClick={onNavigateBack}
              className="btn btn-ghost btn-xs btn-circle"
            >
              <ArrowLeftIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Center: Dropdown */}
        <div ref={dropdownRef} className="relative flex-1 min-w-0">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-base-200 border border-base-300 text-sm font-medium hover:border-primary/40 transition-colors overflow-hidden"
          >
            <span className="truncate">{activeLabel}</span>
            <ChevronDownIcon
              className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-base-100 border border-base-300 rounded-xl shadow-xl z-50 max-h-[70vh] overflow-y-auto">
              {/* Overview */}
              {mainItems
                .filter((item) => item.id === "overview")
                .map((item) => {
                  const Icon = NAV_ICONS[item.id] || EyeIcon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2.5 ${activeTab === item.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-base-200"
                        }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {item.label}
                    </button>
                  );
                })}

              {/* Classification section */}
              {classificationSubItems.length > 0 && (
                <>
                  <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-base-content/40 border-t border-base-200">
                    Classification
                  </div>
                  {classificationSubItems.map((item) => {
                    const hasSelection = item.status === "completed" && (item.htsno || item.selectionDescription);
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item.id)}
                        className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2.5 transition-colors ${activeTab === item.id
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-base-200 text-base-content/70"
                          }`}
                      >
                        <StatusDot status={item.status} />
                        {hasSelection ? (
                          <span className="flex flex-col items-start min-w-0">
                            {item.htsno && (
                              <span className="font-mono font-semibold text-xs truncate max-w-full">
                                {item.htsno}
                              </span>
                            )}
                            {item.selectionDescription && (
                              <span className="text-[10px] font-normal text-base-content/40 truncate max-w-full leading-tight">
                                {item.selectionDescription}
                              </span>
                            )}
                          </span>
                        ) : item.status === "active" ? (
                          "Current Level"
                        ) : (
                          item.label
                        )}
                      </button>
                    );
                  })}
                </>
              )}

              {/* Remaining items */}
              <div className="border-t border-base-200">
                {mainItems
                  .filter((item) => item.id !== "overview")
                  .map((item) => {
                    const Icon = NAV_ICONS[item.id] || ChevronRightIcon;
                    const showLock = !readOnly && isAnonymous && item.lockedForAnon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item.id)}
                        className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2.5 ${activeTab === item.id
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-base-200"
                          }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        {showLock && (
                          <LockClosedIcon className="w-3.5 h-3.5 text-base-content/30 shrink-0" />
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Right: User + Theme */}
        <div className="flex items-center gap-1 shrink-0">
          {useNormalWorkspace && !isAnonymous && <ButtonAccount />}
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};
