"use client";

import { useState } from "react";
import { Explore } from "../../components/Explore";

export default function Home() {
  const [productDescription, setProductDescription] = useState("");

  return (
    <main className="h-svh grow overflow-auto flex flex-col px-3">
      <Explore
        productDescription={productDescription}
        setProductDescription={setProductDescription}
      />
    </main>
  );
}
