"use client";

import { Country } from "../../constants/countries";

export interface CountryOfOriginDisplayProps {
  country: Country;
  isScrolled: boolean;
}

export function CountryOfOriginDisplay({
  country,
  isScrolled,
}: CountryOfOriginDisplayProps) {
  return (
    <div
      className={`flex items-center gap-1.5 transition-all duration-200 ${
        isScrolled ? "mt-0" : "mt-1"
      }`}
    >
      <span className="text-xs text-base-content/50">from</span>
      <span
        className={`text-base ${isScrolled ? "text-base" : "text-lg md:text-xl"}`}
      >
        {country.flag}
      </span>
      <span className="text-xs uppercase font-semibold text-base-content/70">
        {country.name}
      </span>
    </div>
  );
}

