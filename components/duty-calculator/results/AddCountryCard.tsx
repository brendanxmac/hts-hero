"use client";

// The next open slot in the comparison: a button that turns into a country search
import { PlusIcon } from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";
import { Country } from "@/constants/countries";
import * as ui from "@/components/ui/styles";
import { CountryField } from "../fields";

export const AddCountryCard = ({
  countries,
  onAdd,
}: {
  countries: Country[];
  onAdd: (country: Country) => void;
}) => {
  const [searching, setSearching] = useState(false);

  // Put the cursor in the search as soon as it appears
  useEffect(() => {
    if (searching) document.getElementById("dc-compare-add")?.focus();
  }, [searching]);

  return (
    <div className="flex min-h-72 flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-base-content/20 p-6 text-center">
      {searching ? (
        <div className="w-full max-w-xs flex flex-col gap-2 text-left">
          <label htmlFor="dc-compare-add" className={ui.fieldLabel}>
            Compare with
          </label>
          <CountryField
            id="dc-compare-add"
            selected={[]}
            max={1}
            onChange={(picked) => {
              const added = picked[0];
              // Already selected countries have a card; picking one again does nothing
              if (added && !countries.some((c) => c.code === added.code))
                onAdd(added);
              setSearching(false);
            }}
          />
          <button
            type="button"
            className="self-start text-sm font-medium text-base-content/60 hover:text-base-content"
            onClick={() => setSearching(false)}
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          <div>
            <div className={ui.cardTitle}>
              {countries.length === 1
                ? "Compare with another country"
                : "Add another country"}
            </div>
            <p className="mt-1 text-sm text-base-content/60">
              See the duty, fees and landed cost side by side
            </p>
          </div>
          <button
            type="button"
            className={ui.button({ variant: "primary", size: "sm" })}
            onClick={() => setSearching(true)}
          >
            <PlusIcon className="w-4 h-4" />
            Add a country
          </button>
        </>
      )}
    </div>
  );
};
