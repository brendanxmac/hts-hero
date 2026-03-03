"use client";

import Link from "next/link";

interface ClassifyCTAProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaRedirectUrl: string;
}

export function ClassifyCTA({
  title,
  subtitle,
  ctaText,
  ctaRedirectUrl,
}: ClassifyCTAProps) {
  return (
    <div className="my-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-transparent via-primary/10 to-secondary/10 border border-primary/10">
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 shrink-0 mt-0.5">
          <svg
            className="w-5 h-5 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-base md:text-lg font-bold text-base-content">
            {title}
          </span>
          <span className="text-sm text-base-content/60">{subtitle}</span>
        </div>
      </div>
      <Link
        href={ctaRedirectUrl}
        className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm bg-primary text-white hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg whitespace-nowrap"
      >
        <span>{ctaText}</span>
        <svg
          className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
      </Link>
    </div>
  );
}
