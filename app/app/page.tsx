"use client";

import { Search } from "../../components/Search";
import { Classification } from "../../components/Classification";
import { useState } from "react";

export default function Home() {
  const [productDescription, setProductDescription] = useState("");

  return (
    <main className="grow overflow-auto flex flex-col px-5">
      {productDescription ? (
        <Classification
          productDescription={productDescription}
          setProductDescription={setProductDescription}
        />
      ) : (
        <Search setProductDescription={setProductDescription} />
      )}
    </main>
  );
}
