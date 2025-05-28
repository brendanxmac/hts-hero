"use client";

import { useState } from "react";
import { SearchSection } from "../../components/SearchSection";
import { ExploreAuto } from "../../components/ExploreAuto";

export default function Home() {
  const [productDescription, setProductDescription] = useState("");

  return (
    <main className="h-svh grow overflow-auto flex flex-col px-3">
      {productDescription ? (
        <ExploreAuto
          productDescription={productDescription}
          setProductDescription={setProductDescription}
        />
      ) : (
        <SearchSection setProductDescription={setProductDescription} />
      )}
    </main>
  );
}
