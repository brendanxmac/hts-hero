"use client";

import { CheckCircleIcon } from "@heroicons/react/16/solid";
import { Country } from "../../constants/countries";
import { CountryOfOriginDisplay } from "./CountryOfOriginDisplay";

export interface HtsCodeDisplayProps {
  isComplete: boolean;
  latestHtsCode: string | null;
  countryOfOrigin: Country | null;
  isScrolled: boolean;
}

export function HtsCodeDisplay({
  isComplete,
  latestHtsCode,
  countryOfOrigin,
  isScrolled,
}: HtsCodeDisplayProps) {
  const textSizeClass = isScrolled
    ? "text-base md:text-lg"
    : "text-lg md:text-xl";

  const completedTextSizeClass = isScrolled
    ? "text-base md:text-lg"
    : "text-lg md:text-2xl lg:text-3xl";

  if (isComplete) {
    return (
      <div
        className={`relative flex flex-col items-end transition-all duration-200 ${
          isScrolled ? "gap-0" : "gap-1"
        }`}
      >
        <span className="text-xs font-semibold uppercase tracking-widest text-base-content/70">
          HTS Code
        </span>
        {/* HTS Code with checkmark */}
        <div className="flex items-center gap-2">
          <span
            className={`font-bold text-success transition-all duration-200 ${completedTextSizeClass}`}
          >
            {latestHtsCode}
          </span>
        </div>
        {countryOfOrigin && (
          <CountryOfOriginDisplay
            country={countryOfOrigin}
            isScrolled={isScrolled}
          />
        )}
      </div>
    );
  }

  if (latestHtsCode) {
    return (
      <div
        className={`flex flex-col items-end transition-all duration-200 ${
          isScrolled ? "gap-0" : "gap-0.5"
        }`}
      >
        <span className="text-xs font-semibold uppercase tracking-widest text-primary/60">
          Current Code
        </span>
        <span
          className={`font-bold text-primary transition-all duration-200 ${textSizeClass}`}
        >
          {latestHtsCode}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-end transition-all duration-200 ${
        isScrolled ? "gap-0" : "gap-0.5"
      }`}
    >
      <span className="text-xs font-semibold uppercase tracking-widest text-base-content/40">
        In-Progress HTS Code
      </span>
      <span
        className={`text-base-content/30 transition-all duration-200 ${textSizeClass}`}
      >
        ----.--.----
      </span>
    </div>
  );
}
