"use client";

import { useRef, ChangeEvent, useState, useEffect } from "react";
import { classNames } from "../utilities/style";
import { TertiaryText } from "./TertiaryText";

interface Props {
  label?: string;
  placeholder: string;
  defaultValue?: string;
  onSubmit: (value: string) => void;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export default function TextInput({
  label,
  placeholder,
  defaultValue,
  onChange,
  disabled,
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
    <div className="w-full flex flex-col gap-2 border-2 border-base-content/50 rounded-md">
      {label && <TertiaryText value={label} />}
      <div
        className={
          "w-full flex flex-col gap-2 bg-base-100 rounded-md px-4 py-3"
        }
      >
        <textarea
          ref={textareaRef}
          placeholder={placeholder}
          rows={1}
          value={localProductDescription}
          onChange={handleInputChange}
          className="textarea text-base min-h-24 max-h-80 rounded-none resize-none bg-inherit text-black dark:text-white placeholder-base-content/30 focus:ring-0 focus:outline-none border-none p-0"
        ></textarea>

        <div className="flex justify-between items-center">
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
        </div>
      </div>
    </div>
  );
}
