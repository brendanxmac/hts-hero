import { useState, useRef, useEffect } from "react";
import { countries, Country } from "../constants/countries";

interface Props {
  selectedCountries: Country[];
  setSelectedCountries: (countries: Country[]) => void;
}

export const CountrySelection = ({
  selectedCountries,
  setSelectedCountries,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Filter countries based on search term
  const filteredCountries = countries
    .filter((country) =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((country) => country.flag !== "🇺🇸");

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

    if (isAlreadySelected) {
      // Remove country if already selected
      setSelectedCountries(
        selectedCountries.filter((selected) => selected.name !== country.name)
      );
    } else {
      // Add country if not selected
      setSelectedCountries([...selectedCountries, country]);
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
        className="w-full p-1 pr-2 border border-base-content/50 rounded-lg cursor-pointer bg-base-300 flex gap-3 items-center justify-between hover:bg-primary/20 transition-colors min-h-10"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1 flex flex-wrap gap-2 items-center">
          {selectedCountries.length > 0 ? (
            selectedCountries.map((country) => (
              <div
                key={`country-selection-option-${country.name}`}
                className="flex items-center gap-1 bg-primary/20 border border-primary/20 rounded-md px-1 py-0"
              >
                <div className="flex gap-2 items-center">
                  <p className="text-lg">{country.flag}</p>
                  <p className="text-sm text-white font-semibold">
                    {country.name}
                  </p>
                </div>
                <button
                  onClick={(e) => handleRemoveCountry(country, e)}
                  className="ml-1 p-0.5 hover:bg-primary/20 rounded transition-colors"
                  title={`Remove ${country.name}`}
                >
                  <svg
                    className="w-3 h-3 text-white"
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
            <span className="text-sm ml-2">Select Countries of Origin</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {selectedCountries.length > 0 ? (
            <button
              onClick={handleClearAll}
              className="btn btn-link p-1 btn-sm hover:text-secondary no-underline"
              title="Clear all selections"
            >
              clear
            </button>
          ) : (
            <svg
              className={`w-4 h-4 transition-transform text-base-content/70 ${isOpen ? "" : "rotate-180"}`}
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
        <div className="absolute z-10 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-xl max-h-60 overflow-hidden">
          <div className="p-2 border-b border-base-300">
            <input
              type="text"
              placeholder="Search countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-2 border border-base-300 rounded-md bg-base-100 text-base-content placeholder:text-base-content/50 focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
          </div>

          <div className="max-h-48 overflow-y-auto" ref={scrollContainerRef}>
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country, index) => (
                <div
                  key={index}
                  className={`px-3 py-2 cursor-pointer flex items-center justify-between ${
                    index === highlightedIndex
                      ? "bg-primary text-primary-content"
                      : isCountrySelected(country)
                        ? "bg-primary/10 border-l-2 border-primary"
                        : "hover:bg-base-200"
                  }`}
                  onClick={() => handleCountrySelect(country)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <div className="flex items-center">
                    <span className="mr-2">{country.flag}</span>
                    <span
                      className={
                        index === highlightedIndex
                          ? "text-white"
                          : isCountrySelected(country)
                            ? "text-primary font-medium"
                            : "text-base-content"
                      }
                    >
                      {country.name}
                    </span>
                  </div>
                  {isCountrySelected(country) && (
                    <svg
                      className="w-4 h-4 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-base-content/60">
                No countries found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
