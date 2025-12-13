"use client";

import Link from "next/link";
import { Suspense } from "react";
import ClassifierFooter from "@/components/ClassifierFooter";
import { PendingTariffsList } from "../../../components/UpcomingTariffsList";
import TariffImpactPricing from "../../../components/TariffImpactPricing";
import TestimonialsStrip from "../../../components/TestimonialsStrip";
import ProductDemoSection from "../../../components/ProductDemoSection";
import {
  ProductSection,
  ProductSectionData,
} from "../../../components/ProductSection";
import { BoltIcon } from "@heroicons/react/24/solid";
import AboutHeader from "../../../components/AboutHeader";

const productSections: ProductSectionData[] = [
  {
    emoji: "⚡",
    title: "See Tariff Rates",
    tagline: "Instant Rate Lookup",
    description:
      "See tariff rates for any import from ~200 countries. Find the country with the best import rate and compare multiple countries at once.",
    features: [
      {
        icon: "🌍",
        title: "Global Coverage",
        description: "See tariffs for any import from ~200 countries",
      },
      {
        icon: "🔍",
        title: "Find Best Rates",
        description: "Find the country with the best import rate",
      },
      {
        icon: "📊",
        title: "Compare Countries",
        description: "Compare multiple countries at once",
      },
      {
        icon: "🧮",
        title: "Auto Stacking",
        description: "Automatically applies tariff stacking rules",
      },
    ],
    aboutUrl: "/about/tariffs",
    appUrl: "/duty-calculator",
    cta: "Check Rates",
    accentColor: "primary",
    media: {
      src: "/tariffs-hero.mp4",
      type: "video",
    },
  },
  {
    emoji: "💡",
    title: "Discover Savings",
    tagline: "Exemptions & Trade Programs",
    description:
      "See all the tariff exemptions that might apply and explore free trade programs you may be eligible for.",
    features: [
      {
        icon: "🎯",
        title: "Find Exemptions",
        description: "See all the tariff exemptions that might apply",
      },
      {
        icon: "📋",
        title: "Trade Programs",
        description: "Apply free trade programs you may be eligible for",
      },
      {
        icon: "💰",
        title: "Save Money",
        description: "Reduce your import costs with available savings",
      },
    ],
    aboutUrl: "/about/tariffs",
    appUrl: "/duty-calculator",
    cta: "Find Savings",
    accentColor: "primary",
    media: {
      src: "/finds-savings.png",
      type: "image",
    },
  },
  {
    emoji: "🔔",
    title: "Avoid Tariff Surprises",
    tagline: "Stay Informed",
    description:
      "Get notified when your imports are affected by new tariff announcements. Monitor your entire product catalog and know the latest rates before your next purchase order.",
    features: [
      {
        icon: "📬",
        title: "Get Notified",
        description:
          "Get alerts when new tariff announcements affect your imports",
      },
      {
        icon: "📦",
        title: "Monitor Catalog",
        description: "Monitor your entire product catalog",
      },
      {
        icon: "📅",
        title: "Stay Ahead",
        description:
          "Know the latest tariff rate before your next purchase order",
      },
    ],
    aboutUrl: "/about/tariffs",
    appUrl: "/tariffs/impact-checker",
    cta: "Set Up Alerts",
    accentColor: "primary",
    media: {
      src: "/tariff-impact-demo.mp4",
      type: "video",
    },
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      <Suspense
        fallback={
          <div className="h-16 bg-base-100 border-b border-base-content/20" />
        }
      >
        <AboutHeader />
      </Suspense>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-base-100">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-primary/10 md:bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-secondary/10 md:bg-secondary/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center px-4 sm:px-6 py-4 md:pt-20 lg:pt-24">
          {/* Main Hero Content */}
          <div className="text-center max-w-4xl w-full mb-4">
            {/* Compact Trust Indicator */}
            <div className="flex items-center justify-center gap-2 mb-12">
              <BoltIcon className="w-4 h-4 text-primary" />
              <p className="text-sm font-medium">
                Trusted by Trade Professionals
              </p>
              <BoltIcon className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-5">
              See The{" "}
              <span className="bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
                Latest
              </span>{" "}
              Tariffs
              <br />& Exemptions For Any Import
            </h1>

            <p className="text-base-content/80 text-base md:text-lg max-w-4xl mx-auto mb-8">
              Discover every tariff, exemption, and trade agreement for any
              import from any country
            </p>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 w-full">
              <Link
                href="/duty-calculator"
                className="group inline-flex items-center justify-center gap-2 px-16 py-3.5 rounded-xl font-semibold text-base bg-primary text-white hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                <span>Try now</span>
                <svg
                  className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </div>
          </div>

          {/* Demo Video */}
          <div className="w-full max-w-4xl mb-8">
            <div className="relative rounded-xl overflow-hidden border border-primary/20 shadow-lg bg-base-200">
              <video
                src="/tariffs-hero.mp4"
                autoPlay
                loop
                muted
                playsInline
                controls
                controlsList="nofullscreen noplaybackrate nodownload"
                disablePictureInPicture
                className="w-full h-auto object-cover"
                aria-label="Duty Calculator Demo"
              />
            </div>
          </div>

          {/* Testimonials Strip */}
          <TestimonialsStrip />
        </div>
      </div>

      {/* Product Sections */}
      <div id="features">
        {productSections.map((product, index) => (
          <ProductSection key={product.title} product={product} index={index} />
        ))}
      </div>

      {/* Pricing Section */}
      <TariffImpactPricing />

      {/* Demo Section */}
      <ProductDemoSection
        title="See How it Works"
        subtitle="A quick demo so you know exactly what you'll get"
        demoUrl="https://www.youtube.com/embed/KZ6zv9ujarY?si=aEgVcGIC-gLfSMG4"
      />

      {/* Upcoming Tariffs */}
      <PendingTariffsList />

      <ClassifierFooter />
    </div>
  );
}
