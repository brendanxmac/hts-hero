"use client";

import Link from "next/link";
import Image from "next/image";
import { useUser } from "../contexts/UserContext";

export default function Home() {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="text-center max-w-7xl w-full">
        {/* Header */}
        <div className="mb-8">
          {/* Welcome to text */}
          <h3 className="text-lg sm:text-xl mb-4 sm:mb-6 tracking-tight">
            Welcome to
          </h3>

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

          <h1 className="sm:text-xl md:text-2xl lg:text-3xl text-white font-semibold tracking-tight mb-8">
            Useful Tools for Busy Importers and Customs Brokers
          </h1>
        </div>

        {/* Navigation Buttons */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Tariff Import Checker */}
          <Link
            href={user ? "/tariffs/impact-checker" : "/about/tariffs"}
            className="group btn btn-lg h-auto py-6 px-4 bg-base-200 border-2 border-neutral-600 hover:border-primary hover:bg-primary/10 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="text-4xl">⚡️</div>
              <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                Tariff Impact Checker
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Instant tariff impact check for your Imports
              </p>
            </div>
          </Link>

          {/* Classification Assistant */}
          <Link
            href={user ? "/app" : "/about"}
            className="group btn btn-lg h-auto py-6 px-4 bg-base-200 border-2 border-neutral-600 hover:border-primary hover:bg-primary/10 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="text-4xl">🎯</div>
              <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                Classification Assistant
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Smarter Classification for Customs Brokers
              </p>
            </div>
          </Link>

          {/* HTS Explorer */}
          <Link
            href="/explore"
            className="group btn btn-lg h-auto py-6 px-4 bg-base-200 border-2 border-neutral-600 hover:border-primary hover:bg-primary/10 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="text-4xl">📊</div>
              <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                Tariff Wizard
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Find the tariff for any item, from any country
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
