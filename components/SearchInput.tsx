"use client";

import { useState, useRef, ChangeEvent } from "react";
import { classNames } from "../utilities/style";
import { ArrowUpIcon } from "@heroicons/react/20/solid";
import { getHtsCode } from "../libs/hts";
import axios from "axios";

export default function SearchInput() {
  const characterLimit = 250;
  const [productDescription, setProductDescription] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const adjustHeight = (): void => {
    const textarea = textareaRef.current;

    if (textarea) {
      textarea.style.height = "auto"; // Reset height to calculate new height
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setProductDescription(e.target.value);
    adjustHeight();
  };

  const findBestHtsCode = (): void => {
    if (productDescription.trim()) {
      console.log("Message sent:", productDescription);
      setProductDescription("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
    try {
      getHtsCode(productDescription);
    } catch (error) {
      // Handle errors
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.response?.data || error.message);
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };

  return (
    <div className="w-full flex flex-col gap-2 bg-black p-2">
      <div
        className={
          "w-full flex flex-col gap-3 bg-neutral-900 items-start rounded-2xl p-4 max-w-2xl mx-auto"
        }
      >
        <div className="w-full flex">
          <textarea
            ref={textareaRef}
            placeholder="e.g. Stainless steel water bottle for dogs to drink from while travelling..."
            rows={1}
            value={productDescription}
            onChange={handleInputChange}
            className="flex-grow resize-none bg-inherit text-neutral-300 placeholder-neutral-600 focus:ring-0 focus:outline-none"
          ></textarea>
        </div>
        <div className="w-full flex justify-between items-center">
          <p
            className={classNames(
              "text-neutral-500 text-xs",
              productDescription.length > characterLimit
                ? "font-bold"
                : undefined
            )}
          >
            <span
              className={
                productDescription.length > characterLimit
                  ? "text-red-600"
                  : undefined
              }
            >
              {productDescription.length}
            </span>
            {` / ${characterLimit}`}
          </p>
          <button
            onClick={findBestHtsCode}
            type="button"
            disabled={productDescription.length > characterLimit}
            className={classNames(
              productDescription ? "bg-white" : "bg-neutral-700",
              productDescription.length > characterLimit && "bg-neutral-700",
              "h-7 w-7 rounded-lg  flex items-center justify-center text-sm font-bold"
            )}
          >
            <ArrowUpIcon
              className={classNames(
                productDescription
                  ? "text-[#202020]"
                  : "text-gray-characterLimit",
                "h-5 w-5"
              )}
            />
          </button>
        </div>
      </div>

      <h6 className="text-xs text-center font-medium text-[#999999]">
        HTS Hero may make mistakes. Use with discretion.
      </h6>
    </div>
  );
}
