"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { TertiaryText } from "./TertiaryText";
import { classNames } from "../utilities/style";
import { LoadingIndicator } from "./LoadingIndicator";

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
  characterLimit?: number;
  disabled?: boolean;
  loading?: boolean;
}

export default function TariffImpactCodesInput({
  value,
  label,
  placeholder,
  showSaveCodes = true,
  savingCodes,
  onSaveCodes,
  onChange,
  onSubmit,
  isValid,
  validationMessage,
  characterLimit,
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

  return (
    <div
      className={classNames(
        "w-full min-w-0 flex flex-col gap-2 bg-base-100 border-2 border-base-content/20 rounded-md relative",
        value.length > characterLimit ? "border-warning" : undefined
      )}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      {label && <TertiaryText value={label} />}
      <div className="w-full flex flex-col rounded-md bg-base-100 px-2 sm:px-4 py-2 gap-2">
        <div className="relative">
          <textarea
            ref={textareaRef}
            autoFocus
            placeholder={placeholder}
            value={value}
            rows={1}
            onChange={handleInputChange}
            onScroll={handleScroll}
            className="textarea text-sm sm:text-base w-full max-h-48 min-h-10 rounded-none resize-none bg-inherit text-white placeholder-base-content/30 focus:ring-0 focus:outline-none border-none p-1 overflow-y-auto"
          ></textarea>

          {/* Top fade overlay */}
          {showTopFade && (
            <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-base-100 to-transparent pointer-events-none" />
          )}

          {/* Bottom fade overlay */}
          {showBottomFade && (
            <div className="absolute bottom-0 left-0 right-0 h-7 bg-gradient-to-t from-base-100 to-transparent pointer-events-none" />
          )}
        </div>
        {/* Responsive bottom section */}
        <div className="w-full flex flex-col xs:flex-row gap-2 xs:justify-between">
          {/* Character count - more compact on small screens */}
          <div className="flex gap-1 sm:gap-2 items-center bg-base-100/90 backdrop-blur-sm px-1 sm:px-2 py-1 rounded-md border border-base-content/80 w-fit">
            <p
              className={classNames(
                "text-white text-xs whitespace-nowrap",
                value.length >= characterLimit ? "font-bold" : undefined
              )}
            >
              <span
                className={
                  value.length >= characterLimit ? "text-warning" : undefined
                }
              >
                {value.length}
              </span>
              <span>{` / ${characterLimit} characters`}</span>
            </p>
          </div>

          {/* Buttons - stack vertically on very small screens, horizontally on larger */}
          {value.length > 0 && (
            <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto justify-end">
              <button
                className="btn btn-sm btn-neutral w-full xs:w-auto text-xs sm:text-sm"
                disabled={value.length === 0}
                onClick={() => {
                  onChange && onChange("", true);
                  textareaRef.current?.focus();
                }}
              >
                Clear
              </button>

              <button
                disabled={!showSaveCodes || savingCodes}
                className="btn btn-sm btn-primary w-full min-w-20 xs:w-auto text-xs sm:text-sm"
                onClick={() => onSaveCodes && onSaveCodes()}
              >
                {savingCodes ? (
                  <div className="flex gap-1 items-center">
                    <span>Saving</span>
                    <span className="loading loading-spinner loading-xs"></span>
                  </div>
                ) : (
                  <span>Save List</span>
                )}
              </button>

              {onSubmit && (
                <button
                  className="btn btn-sm btn-primary w-full min-w-20 xs:w-auto text-xs sm:text-sm"
                  disabled={isValid === false || disabled}
                  onClick={() => {
                    onSubmit(value);
                  }}
                >
                  {loading ? <LoadingIndicator spinnerOnly /> : "Check Impacts"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
