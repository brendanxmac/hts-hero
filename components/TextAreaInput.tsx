"use client";

import { useRef, ChangeEvent, useState, useEffect } from "react";
import { ArrowRightIcon } from "@heroicons/react/16/solid";

interface Props {
  buttonText?: string;
  label?: string;
  placeholder: string;
  defaultValue?: string;
  onSubmit?: (value: string) => void;
  onChange?: (value: string) => void;
  loading?: boolean;
  disabled?: boolean;
  canSubmit?: boolean;
  showCharacterCount?: boolean;
}

export default function TextAreaInput({
  buttonText,
  label,
  placeholder,
  defaultValue,
  onChange,
  onSubmit,
  canSubmit,
  loading,
  disabled = false,
  showCharacterCount = true,
}: Props) {
  const characterLimit = 500;
  const [localProductDescription, setLocalProductDescription] = useState(
    defaultValue || ""
  );
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const adjustTextAreaHeight = (): void => {
    const textarea = textareaRef.current;

    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setLocalProductDescription(e.target.value);
    onChange && onChange(e.target.value);
    adjustTextAreaHeight();
  };

  useEffect(() => {
    adjustTextAreaHeight();
  }, []);

  const isOverLimit = localProductDescription.length > characterLimit;

  return (
    <div
      className={`w-full flex flex-col gap-3 rounded-2xl transition-all duration-200 ${
        disabled
          ? "bg-base-200/50"
          : isFocused
            ? "bg-base-100 ring-2 ring-primary/50 border-primary/30"
            : "bg-base-100/80 hover:bg-base-100"
      } border border-base-content/10 hover:border-primary/30`}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        textareaRef.current?.focus();
      }}
    >
      {label && (
        <div className="px-4 pt-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
            {label}
          </span>
        </div>
      )}

      <div className="w-full flex flex-col gap-3 px-4 py-4">
        <textarea
          ref={textareaRef}
          autoFocus
          placeholder={placeholder}
          rows={1}
          disabled={disabled}
          value={localProductDescription}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && canSubmit) {
              e.preventDefault();
              e.stopPropagation();
              onSubmit && onSubmit(localProductDescription);
            }
          }}
          className="w-full text-base max-h-96 min-h-16 resize-none bg-transparent placeholder-base-content/40 focus:outline-none leading-relaxed"
        />

        {(showCharacterCount || onSubmit) && (
          <div className="flex justify-between items-center pt-2 border-t border-base-content/5">
            {showCharacterCount && (
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-24 bg-base-content/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      isOverLimit ? "bg-error" : "bg-primary"
                    }`}
                    style={{
                      width: `${Math.min((localProductDescription.length / characterLimit) * 100, 100)}%`,
                    }}
                  />
                </div>
                <span
                  className={`text-xs font-medium ${
                    isOverLimit ? "text-error" : "text-base-content/50"
                  }`}
                >
                  {localProductDescription.length}/{characterLimit}
                </span>
              </div>
            )}
            {onSubmit && (
              <button
                disabled={!canSubmit || loading}
                className={`group relative overflow-hidden px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  canSubmit && !loading
                    ? "bg-gradient-to-r from-primary to-primary/90 text-primary-content hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02]"
                    : "bg-base-content/10 text-base-content/40 cursor-not-allowed"
                }`}
                onClick={() => {
                  onSubmit(localProductDescription);
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                {loading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <>
                      {buttonText || "Submit"}
                      <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
