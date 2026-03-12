"use client";

import {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "@heroicons/react/24/solid";

const CYCLING_PLACEHOLDERS = [
  "Bluetooth noise-cancelling headphones",
  "Stainless steel insulated water bottle",
  "Lithium-ion battery pack for solar storage",
  "Women's cotton knit sweater",
  "CNC machined aluminum enclosure",
  "Organic freeze-dried coffee",
  "LED grow lights for indoor farming",
  "Ceramic tile, glazed, 12×12 inches",
  "Hydraulic excavator bucket teeth",
  "Polyester webbing cargo straps",
  "Optical fiber patch cables, single-mode",
  "Children's plastic building block set",
  "Industrial rubber conveyor belt",
  "Titanium dental implant abutment",
  "Bamboo cutting board with juice groove",
];

const DEFAULT_EXAMPLES = [
  "Bluetooth headphones",
  "Solar inverter",
  "Coffee mugs",
];

const CYCLE_INTERVAL_MS = 3000;
const FADE_DURATION_MS = 400;

interface ClassifyInputProps {
  placeholder?: string;
  placeholders?: string[];
  buttonText?: string;
  defaultValue?: string;
  compact?: boolean;
  examples?: string[] | false;
}

export interface ClassifyInputHandle {
  setDescription: (value: string) => void;
}

export const ClassifyInput = forwardRef<ClassifyInputHandle, ClassifyInputProps>(
  (
    {
      placeholder,
      placeholders,
      buttonText = "Classify My Product",
      defaultValue = "",
      compact = false,
      examples: examplesProp,
    },
    ref,
  ) => {
    const [description, setDescription] = useState(defaultValue);
    const [isFocused, setIsFocused] = useState(false);
    const router = useRouter();

    const examples = examplesProp === false ? [] : (examplesProp ?? DEFAULT_EXAMPLES);

    const cycleList = placeholders ?? CYCLING_PLACEHOLDERS;
    const shouldCycle = !placeholder;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
      if (!shouldCycle) return;

      const interval = setInterval(() => {
        setIsVisible(false);
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % cycleList.length);
          setIsVisible(true);
        }, FADE_DURATION_MS);
      }, CYCLE_INTERVAL_MS);

      return () => clearInterval(interval);
    }, [shouldCycle, cycleList.length]);

    useImperativeHandle(ref, () => ({ setDescription }), []);

    const handleSubmit = useCallback(() => {
      if (!description.trim()) return;
      sessionStorage.setItem("cta_classification_description", description);
      router.push("/classifications");
    }, [description, router]);

    const showPlaceholderOverlay = shouldCycle && !description;
    const staticPlaceholder = placeholder ?? "Describe your product...";

    if (compact) {
      return (
        <div className="flex flex-col gap-2.5">
          <div className="relative">
            <textarea
              placeholder={shouldCycle ? "" : staticPlaceholder}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && description.trim()) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              rows={3}
              className={`w-full text-sm resize-none rounded-xl border px-3 py-2.5 bg-base-100 placeholder-base-content/40 focus:outline-none transition-all duration-200 ${
                isFocused
                  ? "ring-2 ring-primary/50 border-primary/30"
                  : "border-base-content/15 hover:border-primary/30"
              }`}
            />
            {showPlaceholderOverlay && (
              <span
                className="absolute left-3 top-2.5 text-sm text-base-content/40 pointer-events-none transition-opacity"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transitionDuration: `${FADE_DURATION_MS}ms`,
                }}
              >
                {cycleList[currentIndex]}
              </span>
            )}
          </div>
          <button
            disabled={!description.trim()}
            onClick={handleSubmit}
            className={`w-full px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              description.trim()
                ? "bg-primary text-primary-content shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02]"
                : "bg-base-content/10 text-base-content/40 cursor-not-allowed"
            }`}
          >
            {buttonText}
            <ArrowRightIcon className="w-4 h-4" />
          </button>
          {examples.length > 0 && (
            <div className="pt-2 border-t border-base-content/5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-base-content/40 mb-1.5">
                Try an example
              </p>
              <div className="flex flex-wrap gap-1.5">
                {examples.map((example) => (
                  <button
                    key={example}
                    onClick={() => setDescription(example)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-base-200/60 text-base-content/70 border border-base-content/10 hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-all duration-150"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3">
        <div
          className={`flex flex-col sm:flex-row items-stretch rounded-2xl border-2 transition-all duration-200 bg-base-100 shadow-lg ${
            isFocused
              ? "border-primary/40 ring-4 ring-primary/10 shadow-primary/10"
              : "border-base-content/15 hover:border-primary/25 shadow-base-content/5"
          }`}
        >
          <div className="relative flex-1 flex items-center justify-center">
            <textarea
              placeholder={shouldCycle ? "" : staticPlaceholder}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && description.trim()) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              rows={1}
              className="w-full min-h-[56px] max-h-32 text-base resize-none px-5 py-4 bg-transparent placeholder-base-content/40 focus:outline-none leading-relaxed rounded-2xl"
            />
            {showPlaceholderOverlay && (
              <span
                className="absolute left-5 top-4 text-base text-base-content/40 pointer-events-none transition-opacity leading-relaxed"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transitionDuration: `${FADE_DURATION_MS}ms`,
                }}
              >
                {cycleList[currentIndex]}
              </span>
            )}
          </div>
          <button
            disabled={!description.trim()}
            onClick={handleSubmit}
            className={`flex items-center justify-center gap-2 px-6 py-4 sm:px-8 font-bold text-base whitespace-nowrap transition-all duration-300 rounded-b-xl sm:rounded-bl-none sm:rounded-r-xl ${
              description.trim()
                ? "bg-primary text-primary-content shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
                : "bg-base-content/10 text-base-content/40 cursor-not-allowed"
            }`}
          >
            {buttonText}
            <ArrowRightIcon className="w-5 h-5" />
          </button>
        </div>
        {examples.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-base-content/40 whitespace-nowrap">
              Try:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {examples.map((example, i) => (
                <button
                  key={example}
                  onClick={() => setDescription(example)}
                  className="text-xs font-medium text-primary/70 hover:text-primary hover:underline transition-colors"
                >
                  {example}
                  {i < examples.length - 1 && (
                    <span className="text-base-content/30 ml-1.5">
                      &middot;
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  },
);

ClassifyInput.displayName = "ClassifyInput";
