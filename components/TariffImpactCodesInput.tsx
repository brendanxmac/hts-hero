"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { XMarkIcon, BookmarkIcon } from "@heroicons/react/16/solid";

interface Props {
  value: string;
  label?: string;
  placeholder: string;
  showSaveCodes?: boolean;
  savingCodes?: boolean;
  onSaveCodes?: () => void;
  onSubmit?: (value: string) => void;
  onChange?: (value: string, clearSelectedSet?: boolean) => void;
  isValid?: boolean;
  validationMessage?: string;
  disabled?: boolean;
  loading?: boolean;
}

const CHARACTER_LIMIT = 3000;

export default function TariffImpactCodesInput({
  value,
  label,
  placeholder,
  showSaveCodes = false,
  savingCodes,
  onSaveCodes,
  onChange,
  onSubmit,
  isValid,
  disabled,
  loading,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showTopFade, setShowTopFade] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    onChange && onChange(e.target.value);
    resizeTextarea();
  };

  const resizeTextarea = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = "auto";

    // Calculate max height dynamically (12rem = 192px in most cases)
    const computedStyle = window.getComputedStyle(textarea);
    const maxHeightValue = computedStyle.getPropertyValue("max-height");
    const maxHeight =
      maxHeightValue === "none" ? 192 : parseInt(maxHeightValue);

    // Set height based on content, but respect max-height
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;

    // Check scroll position after resize
    setTimeout(() => checkScrollPosition(), 0);
  };

  const checkScrollPosition = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { scrollTop, scrollHeight, clientHeight } = textarea;
    const isScrollable = scrollHeight > clientHeight;

    setShowTopFade(isScrollable && scrollTop > 0);
    setShowBottomFade(
      isScrollable && scrollTop < scrollHeight - clientHeight - 1
    );
  };

  useEffect(() => {
    resizeTextarea();
  }, [value]);

  const handleScroll = () => {
    checkScrollPosition();
  };

  const characterProgress = Math.min((value.length / CHARACTER_LIMIT) * 100, 100);
  const isNearLimit = value.length >= CHARACTER_LIMIT * 0.9;
  const isOverLimit = value.length >= CHARACTER_LIMIT;

  return (
    <div
      className={`w-full min-w-0 flex flex-col gap-3 rounded-xl border transition-all duration-200 ${
        isOverLimit
          ? "border-warning/50 bg-warning/5"
          : "border-base-content/10 bg-base-100/50 focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/10"
      }`}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      {label && (
        <span className="px-4 pt-3 text-xs font-semibold uppercase tracking-widest text-base-content/50">
          {label}
        </span>
      )}
      <div className="w-full flex flex-col px-4 pb-4 gap-3">
        <div className="relative">
          <textarea
            ref={textareaRef}
            autoFocus
            placeholder={placeholder}
            value={value}
            rows={1}
            onChange={handleInputChange}
            onScroll={handleScroll}
            className="textarea text-sm sm:text-base w-full max-h-48 min-h-12 rounded-lg resize-none bg-transparent placeholder-base-content/30 focus:ring-0 focus:outline-none border-none p-2 overflow-y-auto"
          ></textarea>

          {/* Top fade overlay */}
          {showTopFade && (
            <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-base-100 to-transparent pointer-events-none rounded-t-lg" />
          )}

          {/* Bottom fade overlay */}
          {showBottomFade && (
            <div className="absolute bottom-0 left-0 right-0 h-7 bg-gradient-to-t from-base-100 to-transparent pointer-events-none rounded-b-lg" />
          )}
        </div>

        {/* Bottom section */}
        <div className="w-full flex flex-col xs:flex-row gap-3 xs:items-center xs:justify-between">
          {/* Character count with progress bar */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-1">
              <div className="w-24 h-1.5 bg-base-content/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isOverLimit
                      ? "bg-warning"
                      : isNearLimit
                        ? "bg-warning/70"
                        : "bg-primary/50"
                  }`}
                  style={{ width: `${characterProgress}%` }}
                />
              </div>
              <span
                className={`text-xs ${
                  isOverLimit
                    ? "text-warning font-semibold"
                    : "text-base-content/50"
                }`}
              >
                {value.length.toLocaleString()} / {CHARACTER_LIMIT.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Buttons */}
          {value.length > 0 && (
            <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto justify-end">
              <button
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-base-content/5 hover:bg-base-content/10 border border-base-content/10 text-xs font-semibold text-base-content/70 transition-colors"
                disabled={value.length === 0}
                onClick={() => {
                  onChange && onChange("", true);
                  textareaRef.current?.focus();
                }}
              >
                <XMarkIcon className="w-3.5 h-3.5" />
                Clear
              </button>

              {showSaveCodes && (
                <button
                  disabled={savingCodes}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 text-xs font-semibold text-primary transition-colors"
                  onClick={() => onSaveCodes && onSaveCodes()}
                >
                  {savingCodes ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Saving
                    </>
                  ) : (
                    <>
                      <BookmarkIcon className="w-3.5 h-3.5" />
                      Save
                    </>
                  )}
                </button>
              )}

              {onSubmit && (
                <button
                  className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-primary/90 text-primary-content text-xs font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isValid === false || disabled}
                  onClick={() => {
                    onSubmit(value);
                  }}
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    "Check Impacts"
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
