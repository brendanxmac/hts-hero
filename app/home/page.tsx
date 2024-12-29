"use client";

import { InitialSearchSection } from "../../components/InitialSearchSection";
import { SearchingSection } from "../../components/SearchingSection";
import { useHtsContext } from "../../context/hts-context";

export const dynamic = "force-dynamic";

// This is a private page: It's protected by the layout.js component which ensures the user is authenticated.
// It's a server compoment which means you can fetch data (like the user profile) before the page is rendered.
// See https://shipfa.st/docs/tutorials/private-page
export default function Home() {
  const { findingHts } = useHtsContext();

  return (
    <main className="grow overflow-auto flex flex-col">
      {findingHts ? <SearchingSection /> : <InitialSearchSection />}
    </main>
  );
}
