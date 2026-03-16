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
} from "@heroicons/react/16/solid";

interface Props {
  classification: ClassificationI;
  navItems: ClassificationNavItem[];
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onNavigateBack: () => void;
  userProfile: UserProfile | null;
  isAnonymous: boolean;
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

export const MobileNavDropdown = ({
  classification,
  navItems,
  activeTab,
  onTabChange,
  onNavigateBack,
  userProfile,
  isAnonymous,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeItem = navItems.find((item) => item.id === activeTab);
  const activeLabel = activeItem?.label || "Overview";

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
          <button
            onClick={onNavigateBack}
            className="btn btn-ghost btn-xs btn-circle"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center: Dropdown */}
        <div ref={dropdownRef} className="relative flex-1 max-w-xs">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-base-200 border border-base-300 text-sm font-medium hover:border-primary/40 transition-colors"
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
                .map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                      activeTab === item.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-base-200"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}

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
                        className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2.5 transition-colors ${
                          activeTab === item.id
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
                  .map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                        activeTab === item.id
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-base-200"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: User + Theme */}
        <div className="flex items-center gap-1 shrink-0">
          {!isAnonymous && <ButtonAccount />}
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};
