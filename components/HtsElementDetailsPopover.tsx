import { useState, useRef, useEffect, ReactNode, useCallback } from "react";
import { createPortal } from "react-dom";
import { HtsElement, HtsSection } from "../interfaces/hts";
import {
  getHtsElementParents,
  getSectionAndChapterFromChapterNumber,
} from "../libs/hts";
import { XMarkIcon } from "@heroicons/react/20/solid";

interface ClassificationPathItem {
  htsno: string;
  description: string;
  type: "section" | "chapter" | "parent" | "selected";
}

interface Props {
  htsElement: HtsElement;
  htsElements: HtsElement[];
  sections: HtsSection[];
  children: ReactNode;
  /** Use larger text sizes for the popover content */
  largeText?: boolean;
}

export const HtsElementDetailsPopover = ({
  htsElement,
  htsElements,
  sections,
  children,
  largeText = false,
}: Props) => {
  const [showPopover, setShowPopover] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Detect touch device
  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  // Update position when popover is shown
  useEffect(() => {
    if (showPopover && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth < 640;
      const popoverWidth = isMobile
        ? window.innerWidth - 24
        : Math.min(700, window.innerWidth - 48);

      // Calculate left position, ensuring popover stays within viewport
      let left = rect.left + window.scrollX;
      if (left + popoverWidth > window.innerWidth - 12) {
        left = Math.max(12, window.innerWidth - popoverWidth - 12);
      }

      setPosition({
        top: rect.bottom + window.scrollY + 8, // 8px gap below trigger
        left: isMobile ? 12 : left, // On mobile, always 12px from left edge
      });
    }
  }, [showPopover]);

  // Handle click outside to close popover (for touch devices)
  useEffect(() => {
    if (!showPopover || !isTouchDevice) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
        setShowPopover(false);
      }
    };

    // Use a small delay to prevent immediate dismissal on the opening tap
    const timeoutId = setTimeout(() => {
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPopover, isTouchDevice]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (isTouchDevice) return;
    // Cancel any pending close timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setShowPopover(true);
  }, [isTouchDevice]);

  const handleMouseLeave = useCallback(() => {
    if (isTouchDevice) return;
    // Add a small delay before closing to allow mouse to move to popover
    closeTimeoutRef.current = setTimeout(() => {
      setShowPopover(false);
    }, 150); // 150ms delay gives enough time to reach the popover
  }, [isTouchDevice]);

  const handleTriggerClick = useCallback(() => {
    if (isTouchDevice) {
      setShowPopover((prev) => !prev);
    }
  }, [isTouchDevice]);

  const getClassificationPathItems = (): ClassificationPathItem[] => {
    if (!htsElement || sections.length === 0) return [];

    const sectionAndChapter = getSectionAndChapterFromChapterNumber(
      sections,
      Number(htsElement.chapter)
    );
    const parents = getHtsElementParents(htsElement, htsElements);

    if (!sectionAndChapter) return [];

    return [
      {
        htsno: `Section ${sectionAndChapter.section.number}`,
        description: sectionAndChapter.section.description,
        type: "section" as const,
      },
      {
        htsno: `Chapter ${sectionAndChapter.chapter.number}`,
        description: sectionAndChapter.chapter.description,
        type: "chapter" as const,
      },
      ...parents.map((parent) => ({
        htsno: parent.htsno || "—",
        description: parent.description,
        type: "parent" as const,
      })),
      {
        htsno: htsElement.htsno || "—",
        description: htsElement.description,
        type: "selected" as const,
      },
    ];
  };

  const classificationPathItems = getClassificationPathItems();

  if (classificationPathItems.length === 0) {
    return <>{children}</>;
  }

  const popoverContent = showPopover && (
    <div
      ref={popoverRef}
      className="fixed z-[9999] w-[calc(100vw-24px)] sm:w-auto sm:max-w-2xl p-4 sm:p-5 rounded-xl bg-base-100 border border-base-content/20 shadow-2xl"
      style={{
        top: position.top,
        left: position.left,
        animation: "htsPopoverFadeIn 0.15s ease-out",
        boxShadow:
          "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 12px 24px -8px rgba(0, 0, 0, 0.15)",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`font-semibold uppercase tracking-widest text-base-content/50 ${largeText ? "text-xs sm:text-sm" : "text-xs"}`}
          >
            HTS Element Details
          </span>
          {/* Close button for touch devices */}
          {isTouchDevice && (
            <button
              onClick={() => setShowPopover(false)}
              className="p-1 rounded-lg hover:bg-base-content/10 transition-colors"
              aria-label="Close"
            >
              <XMarkIcon className="w-5 h-5 text-base-content/50" />
            </button>
          )}
        </div>
        <div className={`flex flex-col ${largeText ? "gap-3 sm:gap-4" : "gap-2 sm:gap-2.5"}`}>
          {classificationPathItems.map((item, index) => (
            <div
              key={`${item.htsno}-${index}`}
              className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4"
            >
              {/* HTS Code / Label */}
              <div className="sm:w-32 md:w-40 shrink-0">
                <span
                  className={`inline-block font-mono font-bold px-2 py-1 rounded-md text-xs ${
                    largeText ? "sm:text-sm" : ""
                  } ${
                    item.type === "section"
                      ? "text-amber-600 dark:text-amber-400 bg-amber-500/10"
                      : item.type === "chapter"
                        ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                        : item.type === "selected"
                          ? "text-primary bg-primary/10"
                          : "text-base-content/70 bg-base-content/5"
                  }`}
                >
                  {item.htsno}
                </span>
              </div>
              {/* Description */}
              <span
                className={`flex-1 text-base-content font-medium leading-relaxed text-sm ${
                  largeText ? "sm:text-base md:text-lg" : ""
                }`}
              >
                {item.description}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-block"
        onClick={handleTriggerClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </span>
      {/* Render popover in a portal at document body level to escape overflow:hidden containers */}
      {typeof document !== "undefined" &&
        createPortal(
          <>
            {popoverContent}
            <style jsx global>{`
              @keyframes htsPopoverFadeIn {
                from {
                  opacity: 0;
                  transform: translateY(-4px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}</style>
          </>,
          document.body
        )}
    </>
  );
};

