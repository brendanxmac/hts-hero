"use client";

import { Fragment, useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Transition } from "@headlessui/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/16/solid";
import { useOnboardingTour, type OnboardingStep } from "../../hooks";

interface OnboardingTourProps {
  tourId: string;
  steps: OnboardingStep[];
  enabled?: boolean;
  onComplete?: () => void;
}

const SPOTLIGHT_PADDING = 8;
const SPOTLIGHT_RADIUS = 12;

interface ViewportRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function useViewportRect(
  isActive: boolean,
  currentStep: OnboardingStep | null
): ViewportRect | null {
  const [rect, setRect] = useState<ViewportRect | null>(null);
  const rafRef = useRef<number>(0);

  const measure = useCallback(() => {
    if (!currentStep || currentStep.type === "modal" || !currentStep.targetSelector) {
      setRect(null);
      return;
    }
    const el = document.querySelector(currentStep.targetSelector);
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setRect({
      top: r.top - SPOTLIGHT_PADDING,
      left: r.left - SPOTLIGHT_PADDING,
      width: r.width + SPOTLIGHT_PADDING * 2,
      height: r.height + SPOTLIGHT_PADDING * 2,
    });
  }, [currentStep]);

  useEffect(() => {
    if (!isActive) {
      setRect(null);
      return;
    }
    measure();

    const poll = () => {
      measure();
      rafRef.current = requestAnimationFrame(poll);
    };
    rafRef.current = requestAnimationFrame(poll);

    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [isActive, measure]);

  return rect;
}

function computeTooltipPosition(
  rect: ViewportRect | null,
  placement: "top" | "bottom" | "left" | "right",
  tooltipRef: React.RefObject<HTMLDivElement | null>
): React.CSSProperties {
  if (!rect) {
    return {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    };
  }

  const tooltipEl = tooltipRef.current;
  const tooltipW = tooltipEl?.offsetWidth ?? 360;
  const tooltipH = tooltipEl?.offsetHeight ?? 200;
  const gap = 16;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let top: number;
  let left: number;

  switch (placement) {
    case "top":
      top = rect.top - tooltipH - gap;
      left = rect.left + rect.width / 2 - tooltipW / 2;
      break;
    case "bottom":
      top = rect.top + rect.height + gap;
      left = rect.left + rect.width / 2 - tooltipW / 2;
      break;
    case "left":
      top = rect.top + rect.height / 2 - tooltipH / 2;
      left = rect.left - tooltipW - gap;
      break;
    case "right":
      top = rect.top + rect.height / 2 - tooltipH / 2;
      left = rect.left + rect.width + gap;
      break;
  }

  if (top < 8) top = 8;
  if (top + tooltipH > vh - 8) top = vh - tooltipH - 8;
  if (left < 8) left = 8;
  if (left + tooltipW > vw - 8) left = vw - tooltipW - 8;

  return { position: "fixed", top, left };
}

function SpotlightBackdrop({ rect }: { rect: ViewportRect | null }) {
  if (!rect) {
    return (
      <div className="fixed inset-0 bg-black/20 transition-opacity duration-500" />
    );
  }

  const clipPath = `polygon(
    0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%,
    ${rect.left}px ${rect.top + SPOTLIGHT_RADIUS}px,
    ${rect.left + SPOTLIGHT_RADIUS}px ${rect.top}px,
    ${rect.left + rect.width - SPOTLIGHT_RADIUS}px ${rect.top}px,
    ${rect.left + rect.width}px ${rect.top + SPOTLIGHT_RADIUS}px,
    ${rect.left + rect.width}px ${rect.top + rect.height - SPOTLIGHT_RADIUS}px,
    ${rect.left + rect.width - SPOTLIGHT_RADIUS}px ${rect.top + rect.height}px,
    ${rect.left + SPOTLIGHT_RADIUS}px ${rect.top + rect.height}px,
    ${rect.left}px ${rect.top + rect.height - SPOTLIGHT_RADIUS}px,
    ${rect.left}px ${rect.top + SPOTLIGHT_RADIUS}px
  )`;

  return (
    <div
      className="fixed inset-0 bg-black/10 transition-all duration-500 ease-out"
      style={{ clipPath }}
    />
  );
}

function SpotlightRing({ rect }: { rect: ViewportRect }) {
  return (
    <div
      className="fixed pointer-events-none transition-all duration-500 ease-out z-[1]"
      style={{
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        borderRadius: SPOTLIGHT_RADIUS,
        boxShadow:
          "0 0 0 3px oklch(var(--p)), 0 0 20px 6px oklch(var(--p) / 0.45), 0 0 40px 12px oklch(var(--p) / 0.2)",
      }}
    />
  );
}

export default function OnboardingTour({
  tourId,
  steps,
  enabled = true,
  onComplete,
}: OnboardingTourProps) {
  const router = useRouter();
  const {
    isActive,
    currentStep,
    currentIndex,
    totalSteps,
    next,
    prev,
    skip,
  } = useOnboardingTour({ tourId, steps, enabled, onComplete });

  const [mounted, setMounted] = useState(false);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  const viewportRect = useViewportRect(isActive, currentStep);

  useEffect(() => {
    if (!isActive || !currentStep) return;
    const placement = currentStep.placement ?? "bottom";
    setTooltipStyle(
      computeTooltipPosition(viewportRect, placement, tooltipRef)
    );
  }, [isActive, currentStep, viewportRect]);

  useEffect(() => {
    if (isActive) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isActive]);

  if (!mounted || !isActive || !currentStep) return null;

  const isModal = currentStep.type === "modal";
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalSteps - 1;

  const content = (
    <Transition
      show={isActive}
      as={Fragment}
      enter="duration-300 ease-out"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="duration-200 ease-in"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="fixed inset-0 z-[9999]" aria-modal="true" role="dialog" data-onboarding-tour-active>
        {/* Backdrop */}
        <SpotlightBackdrop rect={isModal ? null : viewportRect} />

        {/* Spotlight ring glow around target */}
        {!isModal && viewportRect && <SpotlightRing rect={viewportRect} />}

        {/* Click backdrop to skip */}
        <div
          className="fixed inset-0"
          onClick={skip}
          aria-label="Skip tour"
        />

        {/* Tooltip card */}
        <div
          ref={tooltipRef}
          className="fixed z-[10000] w-[min(360px,calc(100vw-32px))]
            transition-all duration-500 ease-out"
          style={tooltipStyle}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative overflow-hidden rounded-2xl border border-base-content/15 bg-base-100 shadow-2xl">
            {/* Gradient accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-primary via-secondary to-primary" />

            {/* Close button */}
            <button
              type="button"
              onClick={skip}
              className="absolute right-2 top-3 p-1 rounded-lg text-base-content/40
                hover:text-base-content/70 hover:bg-base-200/80 transition-colors"
              aria-label="Close tour"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>

            {/* Body */}
            <div className="px-5 pt-5 pb-4">
              {/* Optional icon */}
              {currentStep.icon && (
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl
                  bg-gradient-to-br from-primary/15 to-secondary/15">
                  {currentStep.icon}
                </div>
              )}

              {/* Title */}
              <h3 className="text-base font-bold text-base-content leading-snug pr-6">
                {currentStep.title}
              </h3>

              {/* Description */}
              <p className="mt-2 text-sm leading-relaxed text-base-content/70">
                {currentStep.description}
              </p>
            </div>

            {/* Footer: dots + nav */}
            <div className="flex items-center justify-between border-t border-base-content/10 px-5 py-3">
              {/* Step dots */}
              <div className="flex items-center gap-1.5">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-full transition-all duration-300 ${i === currentIndex
                      ? "h-2 w-5 bg-primary"
                      : i < currentIndex
                        ? "h-2 w-2 bg-primary/40"
                        : "h-2 w-2 bg-base-content/15"
                      }`}
                  />
                ))}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center gap-2">
                {!isFirst && (
                  <button
                    type="button"
                    onClick={prev}
                    className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold
                      text-base-content/60 hover:text-base-content hover:bg-base-200/80
                      transition-colors"
                  >
                    <ChevronLeftIcon className="h-3.5 w-3.5" />
                    Back
                  </button>
                )}
                {isFirst && (
                  <button
                    type="button"
                    onClick={skip}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold
                      text-base-content/50 hover:text-base-content/70
                      transition-colors"
                  >
                    Skip
                  </button>
                )}
                {currentStep.action ? (
                  <button
                    type="button"
                    onClick={() => {
                      skip();
                      router.push(currentStep.action!.href);
                    }}
                    className="flex items-center gap-1 rounded-lg bg-primary px-4 py-1.5
                      text-xs font-bold text-primary-content
                      hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    {currentStep.action.label}
                    <ChevronRightIcon className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={next}
                    className="flex items-center gap-1 rounded-lg bg-primary px-4 py-1.5
                      text-xs font-bold text-primary-content
                      hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    {isLast ? "Got it!" : "Next"}
                    {!isLast && <ChevronRightIcon className="h-3.5 w-3.5" />}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  );

  return createPortal(content, document.body);
}
