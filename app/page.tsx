"use client";

import Image from "next/image";
import { Suspense } from "react";
import { useUser } from "../contexts/UserContext";
import { AuthenticatedHeader } from "../components/AuthenticatedHeader";
import UnauthenticatedHeader from "../components/UnauthenticatedHeader";
import ProductCard from "../components/ProductCard";

const products = [
  {
    emoji: "💰",
    title: "Tariff Finder",
    description: "Find the Best Tariff Rate for Any Item",
    aboutUrl: "/about/tariffs",
    appUrl: "/explore",
  },
  {
    emoji: "🎯",
    title: "Classification Assistant",
    description: "Turbocharge Your Classifications",
    aboutUrl: "/about",
    appUrl: "/app",
  },
  {
    emoji: "✅",
    title: "Tariff Impact Checker",
    description: "See if your imports are affected by new tariffs",
    aboutUrl: "/about/tariff-impact-checker",
    appUrl: "/tariffs/impact-checker",
  },
];

export default function Home() {
  const { user } = useUser();

  return (
    <div className="h-screen flex flex-col">
      <Suspense
        fallback={
          <div className="h-16 bg-base-100 border-b border-base-content/20" />
        }
      >
        {user ? <AuthenticatedHeader /> : <UnauthenticatedHeader />}
      </Suspense>
      <div className="h-full bg-base-300 flex items-center justify-center p-4">
        <div className="text-center max-w-7xl w-full">
          <div className="mb-8">
            {/* Logo and HTS Hero text */}
            <div className="flex items-center justify-center gap-1 mb-2">
              <Image
                src="/logo.svg"
                alt="HTS Hero"
                width={50}
                height={50}
                className="w-10 h-10 sm:w-12 sm:h-w-12 md:w-16 md:h-16 object-contain"
              />
              <span className="px-2 sm:px-3 py-1 sm:py-2 text-white text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight">
                HTS Hero
              </span>
            </div>

            <h1 className="sm:text-xl md:text-2xl lg:text-3xl text-white font-semibold tracking-tight mb-8 md:mb-12">
              Quicker Classifications. Effortless Tariffs
            </h1>
          </div>

          {/* Navigation Buttons */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {products.map((product) => (
              <ProductCard
                key={product.title}
                emoji={product.emoji}
                title={product.title}
                description={product.description}
                aboutUrl={product.aboutUrl}
                appUrl={product.appUrl}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
