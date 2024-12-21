"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import { classNames } from "../utilities/style";
import axios from "axios";
import { HsHeading, HtsRaw, HtsWithParentReference } from "../interfaces/hts";
import { getBestIndentLevelMatch, getHtsCode } from "../libs/hts";
import { OpenAIModel } from "../libs/openai";
import { setIndexInArray } from "../utilities/data";
import apiClient from "@/libs/api";
import { ChatCompletion } from "openai/resources";

export default function SearchBar() {
  const [productDescription, setProductDescription] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="h-full flex items-center">
        <div className="w-full justify-center flex gap-2 items-center">
          <textarea
            name="product-description"
            id="product-description"
            className="resize-none rows-4 text-balance flex-1 max-w-xl text-sm md:text-base bg-neutral-800 placeholder-neutral-500 p-2 rounded-lg text-white shadow-sm focus:outline-none"
            placeholder="e.g. Stainless steel water bottle for dogs to drink from while travelling..."
            required
            onInput={({ currentTarget: { value } }) =>
              setProductDescription(value)
            }
          />
          {loading ? (
            <button className="btn btn-square h-9 w-9">
              <span className="loading loading-spinner"></span>
            </button>
          ) : (
            <button
              type="button"
              disabled={!productDescription}
              className={classNames(
                productDescription ? "bg-white" : "bg-neutral-800",
                "h-9 w-9 rounded-lg  flex items-center justify-center text-sm font-bold"
              )}
              onClick={async () => {
                try {
                  setLoading(true);
                  getHtsCode(productDescription);
                } catch (error) {
                  // Handle errors
                  if (axios.isAxiosError(error)) {
                    console.error(
                      "Axios error:",
                      error.response?.data || error.message
                    );
                  } else {
                    console.error("Unexpected error:", error);
                  }
                } finally {
                  setLoading(false);
                }
              }}
            >
              <MagnifyingGlassIcon
                className={classNames(
                  productDescription ? "text-[#202020]" : "text-gray-400",
                  "h-5 w-5"
                )}
              />
            </button>
          )}
        </div>
      </div>
      <h6 className="text-xs text-center font-medium text-[#999999]">
        HTS Hero may make mistakes. Use with discretion.
      </h6>
    </div>
  );
}
