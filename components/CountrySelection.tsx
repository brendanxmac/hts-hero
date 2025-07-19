import { useState, useRef, useEffect } from "react";
import { countries, Country } from "../constants/countries";
import { classNames } from "../utilities/style";

export const CountrySelection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [hasUserScrolled, setHasUserScrolled] = useState(false);
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

  // Reset user scroll flag when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setHasUserScrolled(false);
    }
  }, [isOpen]);

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

  // Scroll to selected country when dropdown opens
  useEffect(() => {
    if (
      isOpen &&
      selectedCountry &&
      scrollContainerRef.current &&
      !hasUserScrolled
    ) {
      const selectedIndex = filteredCountries.findIndex(
        (country) => country.name === selectedCountry.name
      );

      if (selectedIndex >= 0) {
        setHighlightedIndex(selectedIndex);

        // Manually scroll to the selected item to avoid affecting the search input
        setTimeout(() => {
          if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const selectedElement = container.children[
              selectedIndex
            ] as HTMLElement;

            if (selectedElement) {
              const containerRect = container.getBoundingClientRect();
              const elementRect = selectedElement.getBoundingClientRect();

              // Only scroll if the element is not fully visible
              if (
                elementRect.top < containerRect.top ||
                elementRect.bottom > containerRect.bottom
              ) {
                const scrollTop =
                  selectedElement.offsetTop -
                  container.offsetTop -
                  container.clientHeight / 2 +
                  selectedElement.clientHeight / 2;
                container.scrollTo({
                  top: Math.max(0, scrollTop),
                  behavior: "smooth",
                });
              }
            }
          }
        }, 0);
      }
    }
  }, [isOpen, selectedCountry, filteredCountries, hasUserScrolled]);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setSearchTerm("");
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleClearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCountry(null);
    setSearchTerm("");
    setHighlightedIndex(-1);
  };

  const handleScroll = () => {
    setHasUserScrolled(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHasUserScrolled(true);
        setHighlightedIndex((prev) =>
          prev < filteredCountries.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHasUserScrolled(true);
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

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="w-full sm:min-w-80 p-3 border border-base-300 rounded-lg cursor-pointer bg-base-100 flex gap-3 items-center justify-between hover:bg-base-200 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedCountry ? (
          <div className="flex items-center gap-2">
            <span className="text-sm">{selectedCountry.flag}</span>
            <span className="text-sm">{selectedCountry.name}</span>
          </div>
        ) : (
          <span className="text-sm">Select Country of Origin</span>
        )}
        <div className="flex items-center gap-1">
          {selectedCountry ? (
            <button
              onClick={handleClearSelection}
              className="p-0.5 hover:bg-primary/80 bg-primary rounded transition-colors"
              title="Clear selection"
            >
              <svg
                className="w-4 h-4 text-base-300"
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

          <div
            className="max-h-48 overflow-y-auto"
            ref={scrollContainerRef}
            onScroll={handleScroll}
          >
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country, index) => (
                <div
                  key={index}
                  className={`px-3 py-2 cursor-pointer flex items-center justify-between ${
                    index === highlightedIndex
                      ? "bg-primary text-primary-content"
                      : selectedCountry?.name === country.name
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
                          : selectedCountry?.name === country.name
                            ? "text-primary font-medium"
                            : "text-base-content"
                      }
                    >
                      {country.name}
                    </span>
                  </div>
                  {selectedCountry?.name === country.name && (
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
