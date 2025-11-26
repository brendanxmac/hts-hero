"use client";

import Image from "next/image";
import { Suspense, useState } from "react";
import { useUser } from "../contexts/UserContext";
import { AuthenticatedHeader } from "../components/AuthenticatedHeader";
import UnauthenticatedHeader from "../components/UnauthenticatedHeader";
import ProductCard, { ProductCardI } from "../components/ProductCard";
import LetsTalkModal from "../components/LetsTalkModal";
import { MixpanelEvent, trackEvent } from "../libs/mixpanel";

const products: ProductCardI[] = [
  {
    emoji: "💰",
    title: "Tariff Finder",
    description: "Find the Best Tariff Rate for Any Item",
    aboutUrl: "/about/tariffs",
    appUrl: "/explore",
    cta: "Find Tariffs",
  },
  {
    emoji: "🎯",
    title: "Classification Assistant",
    description: "Turbocharge Your Classifications",
    aboutUrl: "/about",
    appUrl: "/app",
    cta: "Classify",
  },
  {
    emoji: "✅",
    title: "Tariff Impact Checker",
    description: "See If new tariffs affect your imports",
    aboutUrl: "/about/tariff-impact-checker",
    appUrl: "/tariffs/impact-checker",
    cta: "Check Your Imports",
  },
];

export default function Home() {
  const { user } = useUser();
  const [isBookDemoModalOpen, setIsBookDemoModalOpen] = useState(false);

  const handleBookDemoClick = () => {
    const userEmail = user?.email || "";
    const userName = user?.user_metadata?.full_name || "";

    // Track the event
    try {
      trackEvent(MixpanelEvent.CLICKED_TARIFF_TEAM_LETS_TALK, {
        userEmail,
        userName,
        isLoggedIn: !!user,
      });
    } catch (e) {
      console.error("Error tracking book demo click:", e);
    }

    // Open the modal
    setIsBookDemoModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Suspense
        fallback={
          <div className="h-16 bg-base-100 border-b border-base-content/20" />
        }
      >
        {user ? <AuthenticatedHeader /> : <UnauthenticatedHeader />}
      </Suspense>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-7xl w-full">
          <div className="mb-8">
            {/* Logo and HTS Hero text */}
            <div className="flex items-center justify-center gap-1 mb-2">
              <Image
                src="/logo.svg"
                alt="HTS Hero"
                width={50}
                height={50}
                className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 object-contain"
              />
              <span className="px-2 sm:px-3 py-1 sm:py-2 text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight">
                HTS Hero
              </span>
            </div>

            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold tracking-tight mb-8 md:mb-12">
              Quicker Classifications. Effortless Tariffs
            </h1>
          </div>

          {/* Navigation Buttons */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {products.map((product) => (
              <ProductCard
                key={product.title}
                emoji={product.emoji}
                title={product.title}
                description={product.description}
                aboutUrl={product.aboutUrl}
                appUrl={product.appUrl}
                cta={product.cta}
              />
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-8 py-6 px-14 w-fit mx-auto bg-secondary/5 border border-secondary/20 rounded-2xl shadow-xl">
            <h2 className="text-lg sm:text-xl font-semibold mb-6">
              Want quicker classifications & effortless tariffs for you or your
              team?
            </h2>
            <button
              onClick={handleBookDemoClick}
              className="btn btn-secondary btn-wide"
            >
              Book Demo
            </button>
          </div>
        </div>
      </div>

      <LetsTalkModal
        isOpen={isBookDemoModalOpen}
        onClose={() => setIsBookDemoModalOpen(false)}
        showProductSelector={true}
      />
    </div>
  );
}
