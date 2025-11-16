"use client";

import { useRef, ChangeEvent, useState, useEffect } from "react";
import { classNames } from "../utilities/style";
import { TertiaryText } from "./TertiaryText";
import SquareIconButton from "./SqaureIconButton";
import { ArrowUpIcon } from "@heroicons/react/16/solid";

interface Props {
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
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const adjustTextAreaHeight = (): void => {
    const textarea = textareaRef.current;

    if (textarea) {
      textarea.style.height = "auto"; // Reset height to calculate new height
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

  return (
    <div
      className="w-full flex flex-col gap-2 border-2 border-base-content/50 rounded-md"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        textareaRef.current?.focus();
      }}
    >
      {label && <TertiaryText value={label} />}
      <div
        className={classNames(
          "w-full flex flex-col gap-2 bg-base-100 rounded-md px-4 py-3",
          disabled ? "bg-base-200" : "bg-base-100"
        )}
      >
        <textarea
          ref={textareaRef}
          autoFocus
          placeholder={placeholder}
          rows={1}
          disabled={disabled}
          value={localProductDescription}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.stopPropagation();
              onSubmit && onSubmit(localProductDescription);
            }
          }}
          className="textarea text-base max-h-96 min-h-12 rounded-none resize-none bg-inherit text-white placeholder-base-content/30 focus:ring-0 focus:outline-none border-none p-0"
        ></textarea>

        {(showCharacterCount || onSubmit) && (
          <div className="flex justify-between items-center">
            {showCharacterCount && (
              <p
                className={classNames(
                  "text-neutral-500 text-xs",
                  localProductDescription.length > characterLimit
                    ? "font-bold"
                    : undefined
                )}
              >
                <span
                  className={
                    localProductDescription.length > characterLimit
                      ? "text-red-600"
                      : undefined
                  }
                >
                  {localProductDescription.length}
                </span>
                {` / ${characterLimit}`}
              </p>
            )}
            {onSubmit && (
              <SquareIconButton
                disabled={!canSubmit || loading}
                icon={
                  loading ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <ArrowUpIcon className="h-4 w-4" />
                  )
                }
                onClick={() => {
                  onSubmit(localProductDescription);
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
