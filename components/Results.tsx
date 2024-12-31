"use client";

import { useEffect, useRef, useState } from "react";
import { useHtsContext } from "../context/hts-context";
import { ProductDescriptionHeader } from "./ProductDescriptionHeader";
import SearchInput from "./SearchInput";
import { SearchResults } from "./SearchResults";

export const Results = () => {
  const { productDescription } = useHtsContext();
  const scrollableRef = useRef<HTMLDivElement>(null);
  const [scrollableUpdates, setScrollableUpdates] = useState(0);

  useEffect(() => {
    if (scrollableRef.current) {
      scrollableRef.current.scrollTo({
        top: scrollableRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [scrollableUpdates]);

  return (
    <section className="grow h-full overflow-auto flex flex-col items-center">
      <div
        ref={scrollableRef}
        className="grow w-full mt-2 items-center flex flex-col gap-4 max-w-3xl overflow-y-scroll"
      >
        <div className="sticky top-0 w-full bg-black pb-4 border-b border-neutral-800 shadow-neutral-600">
          <ProductDescriptionHeader description={productDescription} />
        </div>

        <div className="flex flex-col min-w-full max-w-3xl gap-2 items-center">
          <SearchResults setScrollableUpdates={setScrollableUpdates} />
        </div>
      </div>

      <SearchInput />
    </section>
  );
};
