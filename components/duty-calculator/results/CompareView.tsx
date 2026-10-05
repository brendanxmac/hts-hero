"use client";

// Compare: one card per country side by side, the lowest landed cost marked, and a card to add
// the next country
import { Country } from "@/constants/countries";
import { AddCountryCard } from "./AddCountryCard";
import { CompareCard } from "./CompareCard";
import { CompareEntry } from "./compareEntry";

export const CompareView = ({
  entries,
  countries,
  max,
  onAdd,
  customsValue,
  onPreferenceChange,
  onViewDetails,
  onRemove,
}: {
  entries: CompareEntry[];
  // Every selected country, and the most there can be; an empty card offers the next slot
  countries: Country[];
  max: number;
  onAdd: (country: Country) => void;
  customsValue: number;
  onPreferenceChange: (countryCode: string, symbol: string) => void;
  onViewDetails: (country: Country) => void;
  onRemove: (countryCode: string) => void;
}) => {
  const landed = (e: CompareEntry) =>
    customsValue + e.result.totalDuty + e.result.totalFees;
  const lowest = Math.min(...entries.map(landed));
  const lowestEntries = entries.filter(
    (e) => Math.abs(landed(e) - lowest) < 0.005,
  );
  const lowestNames = lowestEntries.map((e) => e.country.name).join(" and ");
  const allTied = lowestEntries.length === entries.length;

  const single = entries.length === 1;
  const canAdd = countries.length < max;
  const cards = entries.length + (canAdd ? 1 : 0);
  const columns =
    cards >= 3
      ? "lg:grid-cols-3 md:grid-cols-2"
      : cards === 2
        ? "md:grid-cols-2"
        : "";

  return (
    <div className={`grid grid-cols-1 ${columns} gap-4 items-stretch`}>
      {entries.map((entry) => (
        <CompareCard
          key={entry.country.code}
          entry={entry}
          customsValue={customsValue}
          landedCost={landed(entry)}
          difference={landed(entry) - lowest}
          isLowest={!allTied && lowestEntries.includes(entry)}
          tiedForLowest={lowestEntries.length > 1}
          allTied={allTied}
          lowestNames={lowestNames}
          single={single}
          onPreferenceChange={onPreferenceChange}
          onViewDetails={onViewDetails}
          onRemove={onRemove}
        />
      ))}
      {canAdd && <AddCountryCard countries={countries} onAdd={onAdd} />}
    </div>
  );
};
