"use client";

import { useRef, ChangeEvent, useState, Dispatch, SetStateAction } from "react";
import { classNames } from "../utilities/style";
import { SparklesIcon } from "@heroicons/react/24/solid";
import { TertiaryInformation } from "./TertiaryInformation";
import SquareIconButton from "./SqaureIconButton";

interface Props {
  label: string;
  placeholder: string;
  setProductDescription: Dispatch<SetStateAction<string>>;
}

export default function TextInput({
  label,
  placeholder,
  setProductDescription,
}: Props) {
  const characterLimit = 500;
  const [localProductDescription, setLocalProductDescription] = useState("");
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
    adjustTextAreaHeight();
  };

  const classifyProduct = (): void => {
    if (localProductDescription.trim()) {
      setProductDescription(localProductDescription.trim());
    }
  };

  //   const handleKeyDown = (event: KeyboardEvent) => {
  //     if (event.key === "Enter") {
  //       event.preventDefault(); // Prevent the default behavior of Enter
  //       classifyProduct();
  //     }
  //   };

  return (
    <div className="w-full flex flex-col gap-2">
      <TertiaryInformation label={label} value="" />
      <div
        className={
          "w-full flex flex-col gap-2 bg-base-300 rounded-md px-4 py-3"
        }
      >
        <textarea
          ref={textareaRef}
          placeholder={placeholder}
          rows={1}
          value={localProductDescription}
          onChange={handleInputChange}
          // @ts-ignore
          //   onKeyDown={handleKeyDown}
          className="textarea text-base rounded-none resize-none bg-inherit text-black dark:text-white placeholder-base-content/30 focus:ring-0 focus:outline-none border-none p-0"
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

          <SquareIconButton
            icon={<SparklesIcon className="h-4 w-4" />}
            onClick={classifyProduct}
            disabled={
              !localProductDescription ||
              localProductDescription.length > characterLimit
            }
          />
        </div>
      </div>
    </div>
  );
}
