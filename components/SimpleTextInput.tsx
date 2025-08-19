"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { TertiaryText } from "./TertiaryText";
import SquareIconButton from "./SqaureIconButton";
import { ArrowUpIcon } from "@heroicons/react/16/solid";
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
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const adjustTextAreaHeight = (): void => {
    const textarea = textareaRef.current;

    if (textarea) {
      textarea.style.height = "auto"; // Reset height to calculate new height
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextAreaHeight();
  }, [value]);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    onChange && onChange(e.target.value);
  };

  return (
    <div
      className="w-full flex flex-col gap-2 bg-base-100 border-2 border-base-content/20 rounded-md"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      {label && <TertiaryText value={label} />}
      <div
        className={
          "w-full flex flex-col gap-2 rounded-md bg-base-100 px-4 py-3"
        }
      >
        <div className="w-full flex gap-2 items-center">
          <textarea
            ref={textareaRef}
            autoFocus
            placeholder={placeholder}
            value={value}
            rows={1}
            onChange={handleInputChange}
            className="textarea w-full max-h-32 min-h-32 rounded-none resize-none bg-inherit text-white placeholder-base-content/30 focus:ring-0 focus:outline-none border-none p-0"
          ></textarea>

          {onSubmit && (
            <SquareIconButton
              disabled={!isValid}
              icon={<ArrowUpIcon className="h-4 w-4" />}
              onClick={() => {
                onSubmit(value);
              }}
            />
          )}
        </div>

        <div className="flex gap-2 items-center">
          <p
            className={classNames(
              "text-neutral-500 text-xs",
              value.length > characterLimit ? "font-bold" : undefined
            )}
          >
            <span
              className={
                value.length > characterLimit ? "text-red-600" : undefined
              }
            >
              {value.length}
            </span>
            {` / ${characterLimit}`}
          </p>

          {value.length > characterLimit && (
            <p className="text-xs text-red-500">
              {validationMessage || "Input Limit Exceeded"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
