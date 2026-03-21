"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { useClassification } from "../contexts/ClassificationContext";
import { MixpanelEvent, trackEvent } from "../libs/mixpanel";
import { useUser } from "../contexts/UserContext";
import toast from "react-hot-toast";

const CYCLING_EXAMPLES = [
  "Industrial rubber conveyor belt used in mining equipment",
  "Lithium-ion battery pack for solar energy storage systems",
  "Stainless steel insulated water bottle",
  "Ceramic brake pads for passenger vehicles",
  "Men's cotton crew-neck t-shirt",
  "Corrugated cardboard shipping boxes for retail packaging",
  "Women's 100% Cotton Knit Sweater",
  "Ceramic tile, glazed, 12×12 inches",
  "Bamboo cutting board with juice groove",
  // "Bluetooth noise-cancelling headphones",
  // "Stainless steel insulated water bottle",
  // "Lithium-ion battery pack for solar storage",
  // "Women's cotton knit sweater",
  // "CNC machined aluminum enclosure",
  // "Organic freeze-dried coffee",
  // "LED grow lights for indoor farming",
  // "Hydraulic excavator bucket teeth",
  // "Polyester webbing cargo straps",
  // "Optical fiber patch cables, single-mode",
  // "Children's plastic building block set",
  // "Industrial rubber conveyor belt",
  // "Titanium dental implant abutment",
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
  navigateOnSubmit?: boolean;
  onSubmit?: (description: string) => void;
  /** Mixpanel entry_point for anonymous classification funnel (e.g. classify_landing) */
  entryPoint?: string;
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
      navigateOnSubmit = true,
      onSubmit: onSubmitProp,
      entryPoint,
    },
    ref,
  ) => {
    const [description, setDescription] = useState(defaultValue);
    const [isFocused, setIsFocused] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [nudge, setNudge] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const router = useRouter();
    const { startNewClassification } = useClassification();
    const { user } = useUser();

    const examples = examplesProp === false ? [] : (examplesProp ?? CYCLING_EXAMPLES);

    const cycleList = placeholders ?? CYCLING_EXAMPLES;
    const shouldCycle = !placeholder && cycleList.length > 0;
    const staticPlaceholder = placeholder || "Enter a description of your product";
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

    const submitWithDescription = useCallback(async (text: string, source: string) => {
      if (!text.trim() || isCreating) return;
      if (onSubmitProp) {
        onSubmitProp(text);
        return;
      }
      if (navigateOnSubmit) {
        setIsCreating(true);
        try {
          const newId = await startNewClassification(text, true);
          const resolvedEntry = entryPoint ?? "unspecified";
          trackEvent(MixpanelEvent.CLASSIFICATION_STARTED, {
            item: text,
            is_anonymous: !user,
            source,
            entry_point: resolvedEntry,
          });
          if (!user) {
            trackEvent(MixpanelEvent.ANONYMOUS_CLASSIFICATION_STARTED, {
              classification_id: newId,
              source,
              entry_point: resolvedEntry,
            });
          }
          router.push(`/classifications/${newId}`);
        } catch (error) {
          console.error("Error starting classification:", error);
          toast.error(
            "Something went wrong. Please try again or contact support."
          );
          setIsCreating(false);
        }
      }
    }, [
      router,
      onSubmitProp,
      navigateOnSubmit,
      isCreating,
      startNewClassification,
      user,
      entryPoint,
    ]);

    const handleSubmit = useCallback(() => {
      if (!description.trim()) {
        setNudge(true);
        textareaRef.current?.focus();
        setTimeout(() => setNudge(false), 3000);
        return;
      }
      submitWithDescription(description, "cta");
    }, [description, submitWithDescription]);

    const exampleIndexRef = useRef(0);
    const handleTryExample = useCallback(() => {
      if (examples.length === 0 || isCreating) return;
      const example = examples[exampleIndexRef.current % examples.length];
      exampleIndexRef.current++;
      setDescription(example);
      submitWithDescription(example, "try_example");
    }, [examples, isCreating, submitWithDescription]);

    const showPlaceholderOverlay = shouldCycle && !description;

    if (compact) {
      return (
        <div className="flex flex-col gap-2.5">
          <div className="relative">
            <textarea
              ref={textareaRef}
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
              className={`w-full text-sm resize-none rounded-xl border px-3 py-2.5 bg-base-100 placeholder-base-content/40 focus:outline-none transition-all duration-200 ${isFocused
                ? "ring-2 ring-primary/50 border-primary/30"
                : "border-base-content/15 hover:border-primary/30"
                }`}
            />
            {showPlaceholderOverlay && (
              <span
                className={`absolute left-3 top-2.5 text-sm pointer-events-none transition-all ${nudge ? "text-secondary font-medium animate-pulse" : "text-base-content/40"}`}
                style={{
                  opacity: nudge ? 1 : (isVisible ? 1 : 0),
                  transitionDuration: `${FADE_DURATION_MS}ms`,
                }}
              >
                {nudge ? "Enter your product description" : cycleList[currentIndex]}
              </span>
            )}
          </div>
          <button
            disabled={isCreating}
            onClick={handleSubmit}
            className="w-full px-4 py-2.5 rounded-xl font-bold text-sm bg-primary text-primary-content transition-all duration-300 flex items-center justify-center gap-2 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02] hover:brightness-110"
          >
            {isCreating ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <>
                {buttonText}
                <ArrowRightIcon className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3">
        {/* Input card */}
        <div
          className={`relative rounded-2xl border-2 transition-all duration-200 bg-base-100 shadow-lg ${isFocused
            ? "border-primary/30 shadow-primary/10 ring-2 ring-primary/5"
            : "border-base-content/15 hover:border-primary/20 shadow-base-content/10"
            }`}
        >
          <textarea
            ref={textareaRef}
            className="w-full min-h-[112px] sm:min-h-[120px] lg:min-h-[144px] max-h-48 text-base lg:text-lg resize-none pl-5 pr-5 pt-4 pb-16 sm:pb-[4.5rem] bg-transparent placeholder-base-content/40 focus:outline-none leading-relaxed rounded-2xl"
            placeholder={shouldCycle ? "" : staticPlaceholder}
            autoFocus={true}
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
            rows={2}
          />
          {showPlaceholderOverlay && (
            <span
              className={`absolute left-5 top-4 right-5 text-base lg:text-lg pointer-events-none transition-all leading-relaxed ${nudge ? "text-secondary font-medium animate-pulse" : "text-base-content/40"}`}
              style={{
                opacity: nudge ? 1 : (isVisible ? 1 : 0),
                transitionDuration: `${FADE_DURATION_MS}ms`,
              }}
            >
              {nudge ? "Enter your product description" : cycleList[currentIndex]}
            </span>
          )}

          {/* Bottom bar pinned inside the card */}
          <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-5 sm:right-4 flex items-center justify-end gap-3">
            {/* {examples.length > 0 ? (
              <button
                type="button"
                onClick={handleTryExample}
                disabled={isCreating}
                className="text-sm text-primary hover:text-primary font-medium transition-colors duration-150 disabled:opacity-50 whitespace-nowrap underline shrink-0"
              >
                Try a sample
              </button>
            ) : (
              <div />
            )} */}
            <button
              disabled={isCreating}
              onClick={handleSubmit}
              className="flex items-center justify-center gap-2 bg-primary text-primary-content font-bold rounded-xl transition-all duration-300 shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02] hover:brightness-110 p-2.5 sm:px-6 sm:py-2.5 shrink-0"
            >
              {isCreating ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <>
                  <span className="text-sm sm:text-base">{buttonText}</span>
                  <ArrowRightIcon className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  },
);

ClassifyInput.displayName = "ClassifyInput";
