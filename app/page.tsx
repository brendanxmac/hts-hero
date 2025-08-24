"use client";

import Link from "next/link";
import Image from "next/image";
import { useUser } from "../contexts/UserContext";

export default function Home() {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="text-center max-w-4xl w-full">
        {/* Header */}
        <div className="mb-8">
          {/* Welcome to text */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
            Welcome to
          </h1>

          {/* Logo and HTS Hero text */}
          <div className="flex items-center justify-center gap-1 mb-10 md:mb-20">
            <Image
              src="/hts-hero-logo.png"
              alt="HTS Hero"
              width={50}
              height={50}
              className="w-10 h-10 sm:w-12 sm:h-w-12 md:w-16 md:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 object-contain"
            />
            <span className="px-2 sm:px-3 py-1 sm:py-2 text-white text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight">
              HTS Hero
            </span>
          </div>

          <p className="text-xl md:text-2xl text-white font-bold">
            How can we help you today?
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Tariff Import Checker */}
          <Link
            href={user ? "/tariffs/impact-checker" : "/about/tariffs"}
            className="group btn btn-lg h-auto py-6 px-4 bg-base-200 border-2 border-neutral-600 hover:border-primary hover:bg-primary/10 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="text-4xl">✅</div>
              <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                Tariff Impact Checker
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Instantly see if your imports are impacted by any recent tariff
                changes
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
                Experience the Smarter way to Classify
              </p>
            </div>
          </Link>

          {/* HTS Explorer */}
          <Link
            href="/explore"
            className="group btn btn-lg h-auto py-6 px-4 bg-base-200 border-2 border-neutral-600 hover:border-primary hover:bg-primary/10 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="text-4xl">🔍</div>
              <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                HTS Explorer + Tariff Calculator
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                HTS Search & Tariff Calculation Made Easy
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
