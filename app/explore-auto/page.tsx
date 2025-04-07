"use client";

import { useState } from "react";
import { Search } from "../../components/Search";
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
        <Search setProductDescription={setProductDescription} />
      )}
    </main>
  );
}
