"use client";

import ButtonAccount from "@/components/ButtonAccount";
import SearchBar from "../../components/SearchBar";
import Link from "next/link";
import config from "@/config";
import logo from "@/app/logo.png";
import Image from "next/image";

export const dynamic = "force-dynamic";

// This is a private page: It's protected by the layout.js component which ensures the user is authenticated.
// It's a server compoment which means you can fetch data (like the user profile) before the page is rendered.
// See https://shipfa.st/docs/tutorials/private-page
export default async function Dashboard() {
  return (
    <div className="flex flex-col h-screen">
      <header className="sticky top-0 h-16 z-10 bg-[#202020] flex justify-between p-4">
        <Link
          className="flex items-center gap-2 shrink-0 "
          href="/"
          title={`${config.appName} homepage`}
        >
          <Image
            src={logo}
            alt={`${config.appName} logo`}
            className="w-8"
            priority={true}
            width={32}
            height={32}
          />
          <span className="font-extrabold text-lg">{config.appName}</span>
        </Link>
        <ButtonAccount />
      </header>
      <main className="flex-1 overflow-auto">
        <section className="h-[calc(100vh-8rem)]">
          <SearchBar />
        </section>
      </main>
    </div>
  );
}
