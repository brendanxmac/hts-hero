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
  collapsedContentInline?: boolean; // If true, collapsed content flows inline with title on larger screens
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
  collapsedContentInline = false,
  children,
  badge,
}: Props) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Determine if we should show collapsed content below the header (mobile or non-inline mode)
  const showCollapsedContentBelow =
    !isExpanded && collapsedContent && !collapsedContentInline;

  return (
    <div
      className={`relative rounded-2xl border border-base-content/15 bg-base-100 ${isExpanded ? "overflow-visible" : "overflow-hidden"}`}
    >
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      {/* Header - Always visible */}
      <button
        className={`relative z-10 w-full p-5 flex items-start md:items-center justify-between gap-4 hover:bg-base-content/[0.02] transition-colors ${
          showCollapsedContentBelow ? "pb-3" : ""
        } ${!isExpanded && collapsedContent && collapsedContentInline ? "pb-3 md:pb-5" : ""}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Left side: Icon + Title + Inline collapsed content on desktop */}
        <div
          className={`flex items-start md:items-center gap-3 min-w-0 ${
            collapsedContentInline ? "flex-1" : ""
          }`}
        >
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-xl ${iconBgClass} border border-current/20 shrink-0`}
          >
            <span className={iconTextClass}>{icon}</span>
          </div>

          {/* Title and inline collapsed content wrapper */}
          <div
            className={`flex flex-col md:flex-row md:items-center gap-2 md:gap-4 min-w-0 ${
              collapsedContentInline ? "flex-1" : ""
            }`}
          >
            {/* Title section */}
            <div className="flex flex-col items-start shrink-0">
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

            {/* Inline collapsed content - shown on desktop when collapsedContentInline is true */}
            {collapsedContent && collapsedContentInline && (
              <div
                className={`hidden md:flex md:justify-end flex-1 min-w-0 transition-opacity duration-300 ${
                  !isExpanded ? "opacity-100" : "opacity-0"
                }`}
              >
                {collapsedContent}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Simple inline summary content when collapsed */}
          <div
            className={`hidden sm:flex items-center gap-2 text-sm text-base-content/70 transition-opacity duration-300 ${
              !isExpanded && summaryContent ? "opacity-100" : "opacity-0"
            }`}
          >
            {summaryContent}
          </div>
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-base-content/5">
            <ChevronDownIcon
              className={`w-4 h-4 text-base-content/60 transition-transform duration-300 ease-in-out ${
                isExpanded ? "" : "-rotate-180"
              }`}
            />
          </div>
        </div>
      </button>

      {/* Rich collapsed content below header - for mobile when inline, or always when not inline */}
      {collapsedContent && (
        <div
          className={`relative z-10 transition-all duration-300 ease-in-out ${
            collapsedContentInline ? "md:hidden" : ""
          } ${!isExpanded ? "opacity-100 px-5 pb-5 pt-0" : "opacity-0 h-0 overflow-hidden"}`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="cursor-pointer">{collapsedContent}</div>
        </div>
      )}

      {/* Expandable Content */}
      <div
        className={`relative z-10 transition-all duration-300 ease-in-out ${
          isExpanded ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
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
