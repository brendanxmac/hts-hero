import { useState, useRef, useEffect } from "react";
import { Countries, Country } from "../constants/countries";

interface Props {
  selectedCountries: Country[];
  setSelectedCountries: (countries: Country[]) => void;
  singleSelect?: boolean;
}

export const CountrySelection = ({
  selectedCountries,
  setSelectedCountries,
  singleSelect = false,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Filter countries based on search term
  const filteredCountries = Countries.filter((country) =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter((country) => country.flag !== "🇺🇸");

  // Reset highlighted index when search term changes
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchTerm]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const highlightedElement = container.children[
        highlightedIndex
      ] as HTMLElement;

      if (highlightedElement) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = highlightedElement.getBoundingClientRect();
        const padding = 4; // Add some padding to ensure element is fully visible

        // Check if element is above the visible area (with padding)
        if (elementRect.top < containerRect.top + padding) {
          const scrollAmount = containerRect.top - elementRect.top + padding;
          container.scrollTop -= scrollAmount;
        }
        // Check if element is below the visible area (with padding)
        else if (elementRect.bottom > containerRect.bottom - padding) {
          const scrollAmount =
            elementRect.bottom - containerRect.bottom + padding;
          container.scrollTop += scrollAmount;
        }
      }
    }
  }, [highlightedIndex]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCountrySelect = (country: Country) => {
    const isAlreadySelected = selectedCountries.some(
      (selected) => selected.name === country.name
    );

    if (singleSelect) {
      // Single select mode: select the country and close dropdown
      if (isAlreadySelected) {
        setSelectedCountries([]);
      } else {
        setSelectedCountries([country]);
      }
      setIsOpen(false);
    } else {
      // Multi-select mode
      if (isAlreadySelected) {
        // Remove country if already selected
        setSelectedCountries(
          selectedCountries.filter((selected) => selected.name !== country.name)
        );
      } else {
        // Add country if not selected
        setSelectedCountries([...selectedCountries, country]);
      }
    }

    setSearchTerm("");
    setHighlightedIndex(-1);
  };

  const handleRemoveCountry = (
    countryToRemove: Country,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setSelectedCountries(
      selectedCountries.filter(
        (country) => country.name !== countryToRemove.name
      )
    );
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCountries([]);
    setSearchTerm("");
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredCountries.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCountries.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredCountries[highlightedIndex]) {
          handleCountrySelect(filteredCountries[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const isCountrySelected = (country: Country) => {
    return selectedCountries.some((selected) => selected.name === country.name);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`w-full h-[45px] px-3 bg-base-200/50 rounded-xl cursor-pointer flex gap-2 items-center justify-between transition-all duration-200 border border-base-content/10 hover:border-primary/30 hover:bg-base-200/70 ${isOpen ? "ring-2 ring-primary/50 border-primary/30" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1 flex flex-wrap gap-1.5 items-center">
          {selectedCountries.length > 0 ? (
            selectedCountries.map((country) => (
              <div
                key={`country-selection-option-${country.name}`}
                className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-md px-2 py-0.5"
              >
                <div className="flex gap-1.5 items-center">
                  <p className="text-base">{country.flag}</p>
                  <p className="text-sm text-base-content font-semibold">
                    {country.name}
                  </p>
                </div>
                <button
                  onClick={(e) => handleRemoveCountry(country, e)}
                  className="p-0.5 hover:bg-primary/20 rounded transition-colors"
                  title={`Remove ${country.name}`}
                >
                  <svg
                    className="w-3 h-3 text-base-content/60"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))
          ) : (
            <span className="text-sm text-base-content/50 font-medium ml-1">
              {singleSelect
                ? "Select Country of Origin"
                : "Select Countries of Origin"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {selectedCountries.length > 0 ? (
            <button
              onClick={handleClearAll}
              className="text-xs font-medium text-base-content/50 hover:text-error transition-colors px-1.5 py-0.5 rounded hover:bg-error/10"
              title="Clear all selections"
            >
              clear
            </button>
          ) : (
            <svg
              className={`w-4 h-4 transition-transform duration-200 text-base-content/40 ${isOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-base-100 border border-base-content/10 rounded-xl shadow-2xl max-h-96 overflow-hidden">
          <div className="p-3 border-b border-base-content/10 bg-base-200/30">
            <input
              type="text"
              placeholder="Search countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-2.5 bg-base-100 rounded-lg border border-base-content/10 placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all duration-200"
              autoFocus
            />
          </div>

          <div className="max-h-56 overflow-y-auto" ref={scrollContainerRef}>
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country, index) => {
                const isSelected = isCountrySelected(country);
                const isHighlighted = index === highlightedIndex;

                // State priority: highlighted > selected > default
                let bgClass = "bg-transparent hover:bg-base-200/70";
                let textClass = "text-base-content";
                let checkClass = "text-primary";

                if (isSelected && !isHighlighted) {
                  bgClass = "bg-primary/10 hover:bg-primary/15";
                  textClass = "text-base-content font-medium";
                  checkClass = "text-primary";
                } else if (isHighlighted) {
                  bgClass = "bg-primary text-primary-content";
                  textClass = "text-primary-content font-medium";
                  checkClass = "text-primary-content";
                }

                return (
                  <div
                    key={index}
                    className={`px-4 py-3 cursor-pointer flex items-center justify-between transition-all duration-150 ${bgClass}`}
                    onClick={() => handleCountrySelect(country)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{country.flag}</span>
                      <span className={textClass}>{country.name}</span>
                    </div>
                    {isSelected && (
                      <svg
                        className={`w-5 h-5 ${checkClass}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-6 text-center text-base-content/50 font-medium">
                No countries found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
