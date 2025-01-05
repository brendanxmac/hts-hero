"use client";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { ProductDescriptionHeader } from "./ProductDescriptionHeader";
import SearchInput from "./SearchInput";
import { ClassificationResults } from "./ClassificationResults";

interface Props {
  productDescription: string;
  setProductDescription: Dispatch<SetStateAction<string>>;
}

export const Classification = ({
  productDescription,
  setProductDescription,
}: Props) => {
  const scrollableRef = useRef<HTMLDivElement>(null);
  const [updateScrollHeight, setUpdateScrollHeight] = useState(0);

  useEffect(() => {
    if (scrollableRef.current) {
      scrollableRef.current.scrollTo({
        top: scrollableRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [updateScrollHeight]);

  return (
    <section className="grow h-full overflow-auto flex flex-col items-center">
      <div className="grow w-full mt-2 items-center flex flex-col max-w-4xl overflow-y-scroll mb-4">
        <div className="sticky top-0 w-full bg-black bg-opacity-95 pb-4 border-b border-neutral-800 shadow-neutral-600">
          <ProductDescriptionHeader description={productDescription} />
        </div>

        <div
          ref={scrollableRef}
          className="flex flex-col min-w-full max-w-4xl gap-2 items-center overflow-y-auto"
        >
          <ClassificationResults
            productDescription={productDescription}
            setUpdateScrollHeight={setUpdateScrollHeight}
          />
        </div>
      </div>

      <SearchInput
        placeholder="Enter another product description"
        setProductDescription={setProductDescription}
      />
    </section>
  );
};
