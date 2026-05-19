"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export interface OnboardingStep {
  id: string;
  type: "spotlight" | "modal";
  targetSelector?: string;
  title: string;
  description: string;
  placement?: "top" | "bottom" | "left" | "right";
  icon?: React.ReactNode;
}

interface UseOnboardingTourOptions {
  tourId: string;
  steps: OnboardingStep[];
  enabled?: boolean;
  onComplete?: () => void;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface UseOnboardingTourReturn {
  isActive: boolean;
  currentStep: OnboardingStep | null;
  currentIndex: number;
  totalSteps: number;
  targetRect: TargetRect | null;
  next: () => void;
  prev: () => void;
  skip: () => void;
}

function getStorageKey(tourId: string) {
  return `onboarding_${tourId}_completed`;
}

export function isTourCompleted(tourId: string): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(getStorageKey(tourId)) === "true";
}

function markTourCompleted(tourId: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(getStorageKey(tourId), "true");
}

function getTargetRect(selector: string): TargetRect | null {
  const el = document.querySelector(selector);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return null;
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
    width: rect.width,
    height: rect.height,
  };
}

function findNextVisibleIndex(
  steps: OnboardingStep[],
  from: number,
  direction: 1 | -1
): number {
  let i = from;
  while (i >= 0 && i < steps.length) {
    const step = steps[i];
    if (step.type === "modal" || !step.targetSelector) return i;
    if (document.querySelector(step.targetSelector)) return i;
    i += direction;
  }
  return -1;
}

export function useOnboardingTour({
  tourId,
  steps,
  enabled = true,
  onComplete,
}: UseOnboardingTourOptions): UseOnboardingTourReturn {
  const [isActive, setIsActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const rafRef = useRef<number>(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!enabled || steps.length === 0) return;
    if (isTourCompleted(tourId)) return;

    const timer = setTimeout(() => {
      if (document.querySelector("[data-onboarding-tour-active]")) return;
      const firstVisible = findNextVisibleIndex(steps, 0, 1);
      if (firstVisible === -1) return;
      setCurrentIndex(firstVisible);
      setIsActive(true);
    }, 600);

    return () => clearTimeout(timer);
  }, [tourId, steps, enabled]);

  const currentStep = isActive ? steps[currentIndex] ?? null : null;

  const updateRect = useCallback(() => {
    if (!currentStep) {
      setTargetRect(null);
      return;
    }
    if (currentStep.type === "modal" || !currentStep.targetSelector) {
      setTargetRect(null);
      return;
    }
    setTargetRect(getTargetRect(currentStep.targetSelector));
  }, [currentStep]);

  useEffect(() => {
    if (!isActive) return;
    updateRect();

    let lastRect = JSON.stringify(targetRect);
    const poll = () => {
      updateRect();
      const newRect = JSON.stringify(targetRect);
      if (newRect !== lastRect) lastRect = newRect;
      rafRef.current = requestAnimationFrame(poll);
    };
    rafRef.current = requestAnimationFrame(poll);

    const onScroll = () => updateRect();
    const onResize = () => updateRect();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [isActive, currentIndex, updateRect]);

  const complete = useCallback(() => {
    setIsActive(false);
    markTourCompleted(tourId);
    onCompleteRef.current?.();
  }, [tourId]);

  const next = useCallback(() => {
    const nextIdx = findNextVisibleIndex(steps, currentIndex + 1, 1);
    if (nextIdx === -1) {
      complete();
    } else {
      setCurrentIndex(nextIdx);
    }
  }, [steps, currentIndex, complete]);

  const prev = useCallback(() => {
    const prevIdx = findNextVisibleIndex(steps, currentIndex - 1, -1);
    if (prevIdx >= 0) {
      setCurrentIndex(prevIdx);
    }
  }, [steps, currentIndex]);

  const skip = useCallback(() => {
    complete();
  }, [complete]);

  return {
    isActive,
    currentStep,
    currentIndex,
    totalSteps: steps.length,
    targetRect,
    next,
    prev,
    skip,
  };
}
