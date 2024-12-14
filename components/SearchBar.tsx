import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import { classNames } from "../utilities/styles";

export default function SearchBar() {
  const [isProductDescription, setIsProductDescription] = useState(false);
  return (
    <div className="flex flex-col overflow-hidden">
      <div className="bg-[#202020] h-[46rem] flex items-center">
        <div className="w-full flex flex-col gap-5 flex-1 items-center justify-items-center">
          <h2 className="text-white font-bold text-xl md:text-3xl">
            Enter Product Description
          </h2>
          <div className="w-[80%] justify-center flex gap-2 items-center">
            <input
              type="text"
              name="product-description"
              id="product-description"
              className="flex-1 h-9 max-w-xl text-sm md:text-base bg-[#313131] placeholder-[#A6A6A6] p-2 rounded-lg text-white shadow-sm focus:outline-none"
              placeholder="e.g. Stainless steel water bottle for dogs to drink from while travelling..."
              required
              onInput={(e) => {
                setIsProductDescription(Boolean(e.currentTarget.value));
                console.log(e.currentTarget.value);
              }}
            />
            <button
              type="button"
              disabled={!isProductDescription}
              onClick={() => {
                console.log("button clicked");
              }}
              className={classNames(
                isProductDescription ? "bg-white" : "bg-[#313131]",
                "h-9 w-9 rounded-lg  flex items-center justify-center text-sm font-medium"
              )}
            >
              <MagnifyingGlassIcon
                className={classNames(
                  isProductDescription ? "text-[#202020]" : "text-gray-400",
                  "h-5 w-5"
                )}
              />
            </button>
          </div>
          <h6 className="text-xs text-center font-medium text-[#999999]">
            HTS Hero may make mistakes. Use with discretion.
          </h6>
        </div>
      </div>
      <div className="absolute -bottom-52 rounded-full overflow-y-hidden h-96 w-full bg-[#40C969] blur-3xl"></div>
    </div>
  );
}
