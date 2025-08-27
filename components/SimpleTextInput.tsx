"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { TertiaryText } from "./TertiaryText";
import { ArrowUpIcon, XMarkIcon } from "@heroicons/react/16/solid";
import { classNames } from "../utilities/style";

interface Props {
  value: string;
  label?: string;
  placeholder: string;
  onSubmit?: (value: string) => void;
  onChange?: (value: string) => void;
  isValid?: boolean;
  validationMessage?: string;
  characterLimit?: number;
  disabled?: boolean;
}

export default function SimpleTextInput({
  value,
  label,
  placeholder,
  onChange,
  onSubmit,
  isValid,
  validationMessage,
  characterLimit,
  disabled,
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
        "w-full flex flex-col gap-2 bg-base-100 border-2 border-base-content/20 rounded-md relative",
        value.length > characterLimit ? "border-warning" : undefined
      )}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      {label && <TertiaryText value={label} />}
      <div className="w-full flex flex-col rounded-md bg-base-100 px-4 py-2 gap-2">
        <div className="relative">
          <textarea
            ref={textareaRef}
            autoFocus
            placeholder={placeholder}
            value={value}
            rows={1}
            onChange={handleInputChange}
            onScroll={handleScroll}
            className="textarea text-base w-full max-h-48 min-h-10 rounded-none resize-none bg-inherit text-white placeholder-base-content/30 focus:ring-0 focus:outline-none border-none p-1 overflow-y-auto"
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
        <div className="w-full flex justify-between">
          <div className="flex gap-2 items-center bg-base-100/90 backdrop-blur-sm px-2 py-1 rounded-md border border-base-content/80">
            <p
              className={classNames(
                "text-white text-xs",
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
              {` / ${characterLimit} characters`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="btn btn-sm btn-neutral"
              disabled={value.length === 0}
              onClick={() => {
                onChange && onChange("");
                textareaRef.current?.focus();
              }}
            >
              Clear
            </button>

            {onSubmit && (
              <button
                className="btn btn-sm btn-primary"
                disabled={isValid === false || disabled}
                onClick={() => {
                  onSubmit(value);
                }}
              >
                Submit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
