"use client";

import { useState, ReactNode } from "react";
import { ChevronDownIcon } from "@heroicons/react/16/solid";

interface Props {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  iconBgClass?: string;
  iconTextClass?: string;
  defaultExpanded?: boolean; // defaults to false
  summaryContent?: ReactNode; // Simple inline summary (shown next to chevron)
  collapsedContent?: ReactNode; // Rich collapsed content (shown below header when collapsed)
  children: ReactNode;
  badge?: ReactNode;
}

export const CollapsibleSection = ({
  title,
  subtitle,
  icon,
  iconBgClass = "bg-primary/20",
  iconTextClass = "text-primary",
  defaultExpanded = false,
  summaryContent,
  collapsedContent,
  children,
  badge,
}: Props) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-base-content/15 bg-base-100">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      {/* Header - Always visible */}
      <button
        className={`relative z-10 w-full p-5 flex items-center justify-between gap-4 hover:bg-base-content/[0.02] transition-colors ${
          !isExpanded && collapsedContent ? "pb-3" : ""
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-xl ${iconBgClass} border border-current/20 shrink-0`}
          >
            <span className={iconTextClass}>{icon}</span>
          </div>
          <div className="flex flex-col items-start min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-base-content">{title}</h3>
              {badge}
            </div>
            {subtitle && (
              <p className="text-sm text-base-content/60 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Simple inline summary content when collapsed */}
          {!isExpanded && summaryContent && (
            <div className="hidden sm:flex items-center gap-2 text-sm text-base-content/70">
              {summaryContent}
            </div>
          )}
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-lg bg-base-content/5 transition-transform duration-200 ${
              isExpanded ? "" : "-rotate-180"
            }`}
          >
            <ChevronDownIcon className="w-4 h-4 text-base-content/60" />
          </div>
        </div>
      </button>

      {/* Rich collapsed content - shown below header when collapsed */}
      {!isExpanded && collapsedContent && (
        <div
          className="relative z-10 px-5 pb-5 pt-0"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="cursor-pointer">{collapsedContent}</div>
        </div>
      )}

      {/* Expandable Content */}
      <div
        className={`relative z-10 overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-5 pb-5 pt-0">
          <div className="h-px bg-gradient-to-r from-transparent via-base-content/10 to-transparent mb-5" />
          {children}
        </div>
      </div>
    </div>
  );
};
