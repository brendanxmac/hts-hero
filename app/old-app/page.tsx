"use client";

import { SearchSection } from "../../components/SearchSection";
import { Classification } from "../../components/Classification";
import { useState } from "react";

export default function Home() {
  const [productDescription, setProductDescription] = useState("");

  return (
    <main className="h-svh grow overflow-auto flex flex-col px-3">
      {productDescription ? (
        <Classification
          productDescription={productDescription}
          setProductDescription={setProductDescription}
        />
      ) : (
        <SearchSection setProductDescription={setProductDescription} />
      )}
    </main>
  );
}
