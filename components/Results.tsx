"use client";

import { useHtsContext } from "../context/hts-context";
import { SectionLabel } from "./SectionLabel";
import { ProductDescriptionHeader } from "./ProductDescriptionHeader";
import SearchInput from "./SearchInput";
import { SearchResults } from "./SearchResultSummary";

export const Results = () => {
  const { productDescription } = useHtsContext();
  return (
    <section className="grow h-full overflow-auto flex flex-col px-6">
      <div className="grow mt-2 items-center flex flex-col gap-4 overflow-y-auto">
        <ProductDescriptionHeader description={productDescription} />

        <div className="flex flex-col min-w-full max-w-4xl gap-2 items-center">
          <SectionLabel value="Classification" />
          <SearchResults />
        </div>
      </div>

      <div className="z-10 sticky bottom-0 w-full">
        <SearchInput />
      </div>
    </section>
  );
};
