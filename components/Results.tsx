"use client";

import { useHtsContext } from "../context/hts-context";
import { ProductDescriptionHeader } from "./ProductDescriptionHeader";
import SearchInput from "./SearchInput";
import { SearchResults } from "./SearchResults";

export const Results = () => {
  const { productDescription } = useHtsContext();
  return (
    <section className="grow h-full overflow-auto flex flex-col items-center">
      <div className="grow w-full mt-2 items-center flex flex-col gap-4 max-w-3xl overflow-y-auto">
        <ProductDescriptionHeader description={productDescription} />

        <div className="flex flex-col min-w-full max-w-3xl gap-2 items-center">
          <SearchResults />
        </div>
      </div>

      <SearchInput />
    </section>
  );
};
