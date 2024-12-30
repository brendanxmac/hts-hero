"use client";

import { Search } from "../../components/Search";
import { Results } from "../../components/Results";
import { useHtsContext } from "../../context/hts-context";

// This is a private page: It's protected by the layout.js component which ensures the user is authenticated.
// It's a server compoment which means you can fetch data (like the user profile) before the page is rendered.
// See https://shipfa.st/docs/tutorials/private-page
export default function Home() {
  // TODO: remove this from context.. replace with state
  const { findingHts } = useHtsContext();

  return (
    <main className="grow overflow-auto flex flex-col px-5">
      {findingHts ? <Results /> : <Search />}
    </main>
  );
}
