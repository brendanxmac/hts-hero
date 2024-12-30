"use client";

import { useRef, ChangeEvent, useState } from "react";
import { classNames } from "../utilities/style";
import { ArrowUpIcon } from "@heroicons/react/20/solid";
import axios from "axios";
import { useHtsContext } from "../context/hts-context";

// TODO: consider passing "placeholder" prop to allow the placeholder text
// to change depending on the callers context
export default function SearchInput() {
  const characterLimit = 250;
  const { setFindingHts, setProductDescription } = useHtsContext();
  const [localProductDescription, setLocalProductDescription] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const adjustHeight = (): void => {
    const textarea = textareaRef.current;

    if (textarea) {
      textarea.style.height = "auto"; // Reset height to calculate new height
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setLocalProductDescription(e.target.value);
    adjustHeight();
  };

  const findBestHtsCode = (): void => {
    if (localProductDescription.trim()) {
      setProductDescription(localProductDescription.trim());
      setLocalProductDescription("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
    try {
      setFindingHts(true);
    } catch (error) {
      // Handle errors
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.response?.data || error.message);
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent the default behavior of Enter
      findBestHtsCode();
    }
  };

  return (
    <div className="w-full max-w-2xl flex flex-col gap-2 bg-black py-3">
      <div
        className={
          "w-full flex flex-col gap-3 bg-neutral-900 items-start rounded-2xl p-4 mx-auto"
        }
      >
        <div className="w-full flex">
          <textarea
            ref={textareaRef}
            placeholder="Enter product description"
            rows={1}
            value={localProductDescription}
            onChange={handleInputChange}
            // @ts-ignore
            onKeyDown={handleKeyDown}
            className="flex-grow resize-none bg-inherit text-neutral-300 placeholder-neutral-600 focus:ring-0 focus:outline-none"
          ></textarea>
        </div>
        <div className="w-full flex justify-between items-center">
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
          <button
            onClick={findBestHtsCode}
            type="button"
            disabled={localProductDescription.length > characterLimit}
            className={classNames(
              localProductDescription ? "bg-white" : "bg-neutral-700",
              localProductDescription.length > characterLimit &&
                "bg-neutral-700",
              "h-7 w-7 rounded-lg  flex items-center justify-center text-sm font-bold"
            )}
          >
            <ArrowUpIcon
              className={classNames(
                localProductDescription
                  ? "text-[#202020]"
                  : "text-gray-characterLimit",
                "h-5 w-5"
              )}
            />
          </button>
        </div>
      </div>

      <h6 className="text-xs text-center font-medium text-neutral-500">
        HTS Hero may make mistakes. Use with discretion.
      </h6>
    </div>
  );
}
