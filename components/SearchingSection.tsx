"use client";

import { useHtsContext } from "../context/hts-context";
import { ProductDescriptionHeader } from "./ProductDescriptionHeader";
import SearchInput from "./SearchInput";
import { SearchResults } from "./SearchResultSummary";

export const SearchingSection = () => {
  const { currentClassification, productDescription } = useHtsContext();
  return (
    <section className="grow h-full overflow-auto flex flex-col">
      <div className="grow mt-2 items-center flex flex-col gap-4 overflow-y-auto">
        <div className="w-full px-4 justify-items-center">
          <ProductDescriptionHeader description={productDescription} />
        </div>

        <div className="w-full justify-items-center px-4">
          <SearchResults />
        </div>
      </div>
      <div className="z-10 sticky bottom-0 w-full">
        <SearchInput />
      </div>
    </section>
  );
};
