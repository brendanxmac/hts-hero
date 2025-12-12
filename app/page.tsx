"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import LetsTalkModal from "../components/LetsTalkModal";
import { useUser } from "../contexts/UserContext";
import { AboutPage } from "../enums/classify";
import { MixpanelEvent, trackEvent } from "../libs/mixpanel";
import LandingHeader from "../components/LandingHeader";
import Pricing from "../components/Pricing";
import { BoltIcon } from "@heroicons/react/24/solid";
import {
  ProductSection,
  ProductSectionData,
} from "../components/ProductSection";
import TestimonialsStrip from "../components/TestimonialsStrip";
import { FAQ } from "../components/FAQ";
import { bundleFaqList } from "../constants/faq";
import Footer from "../components/Footer";
import UseCases from "../components/UseCases";

const productSections: ProductSectionData[] = [
  {
    emoji: "💰",
    title: "Duty & Tariff Calculator",
    tagline: "Master Tariffs, Discover Savings",
    description:
      "See the complete tariff & cost breakdown for any US import and discover ways to save with exemptions and special trade programs.",
    features: [
      {
        icon: "🌍",
        title: "Know your Costs",
        description:
          "See the landed cost, duty rates, and itemized tariffs for any import from any country",
      },
      {
        icon: "💡",
        title: "Discover Savings",
        description:
          "Find exemptions and trade programs you might be eligible for",
      },
      {
        icon: "💡",
        title: "Share Your Results",
        description:
          "Share your tariff & duty details with clients and colleagues in a single click",
      },
      {
        icon: "⚡",
        title: "Stay Up to Date",
        description:
          "Updated with the latest tariff announcements, changes, and rules",
      },
    ],
    aboutUrl: "/about/tariffs",
    appUrl: "/duty-calculator",
    cta: "Find Tariffs",
    accentColor: "primary",
    media: {
      src: "/tariffs-hero.mp4",
      type: "video",
    },
  },
  {
    emoji: "🎯",
    title: "Classification Assistant",
    tagline: "Classify Quicker, Without Cutting Corners",
    description:
      "Turbocharge your HTS classifications with AI-powered candidate discovery, GRI analysis, cross-rulings validation, and branded advisory reports.",
    features: [
      {
        icon: "🤖",
        title: "Quick Candidates",
        description:
          "See likely candidate suggestions for any product description",
      },
      {
        icon: "📋",
        title: "Best-Fit Analysis",
        description: "Get a GRI analysis of all candidates, in seconds",
      },
      {
        icon: "⚖️",
        title: "CROSS Validation",
        description:
          "See relevant government rulings to validate your classification",
      },
      {
        icon: "📄",
        title: "One-Click Reports",
        description:
          "Instantly generate branded, professional classification reports",
      },
      {
        icon: "📄",
        title: "Bring your Team",
        description: "See, Review, & Approve Each Others Classifications",
      },
    ],
    aboutUrl: "/about",
    appUrl: "/classifications",
    cta: "Classify Now",
    accentColor: "secondary",
    media: {
      src: "/new-hero-demo.mp4",
      type: "video",
    },
  },
  {
    emoji: "✅",
    title: "Tariff Impact Checker",
    tagline: "No More Tariff Surprises",
    description:
      "Instantly see which of your imports are affected by the latest tariff announcements. Get notified before changes hit your bottom line.",
    features: [
      {
        icon: "📦",
        title: "Bulk Checking",
        description:
          "Check your entire product catalog against any tariff announcement, all at once",
      },
      {
        icon: "🔔",
        title: "Intelligent Alerts",
        description: "Get notified when new tariffs affect any of your imports",
      },
      {
        icon: "📈",
        title: "Impact Analysis",
        description:
          "See exactly how each tariff change affects your import costs",
      },
      {
        icon: "🛡️",
        title: "Stay Ahead",
        description:
          "Know about tariff changes before your next purchase order",
      },
    ],
    aboutUrl: "/about/tariff-impact-checker",
    appUrl: "/tariffs/impact-checker",
    cta: "Check Your Imports",
    accentColor: "primary",
    media: {
      src: "/tariff-impact-demo.mp4",
      type: "video",
    },
  },
];

export default function Home() {
  const { user } = useUser();
  const [isBookDemoModalOpen, setIsBookDemoModalOpen] = useState(false);
  const [isToolMenuOpen, setIsToolMenuOpen] = useState(false);

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
    <div className="min-h-screen flex flex-col bg-base-100">
      <Suspense
        fallback={
          <div className="h-16 bg-base-100 border-b border-base-content/20" />
        }
      >
        <LandingHeader />
      </Suspense>

      {/* Hero Section with Integrated Social Proof */}
      <div className="relative overflow-hidden bg-base-100">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-primary/10 md:bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-secondary/10 md:bg-secondary/20 rounded-full blur-3xl" />
          {/* <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" /> */}
        </div>

        <div className="relative z-10 flex flex-col items-center px-4 sm:px-6 py-4 pt-8 md:pt-12 lg:pt-16">
          {/* Main Hero Content */}
          <div className="text-center max-w-4xl w-full mb-4">
            {/* Compact Trust Indicator */}
            <div className="flex items-center justify-center gap-2 mb-12">
              <BoltIcon className="sm:w-4 sm:h-4 w-3 h-3 text-primary" />
              <p className="text-sm font-medium sm:hidden px-4 sm:px-0">
                Save Hours On Classifications,
                <br /> Duty Quotes, & Tariff Checks
              </p>
              <p className="text-sm font-medium hidden sm:block">
                Save Hours On HTS Classifications, Duty Quotes, & Tariff Checks
              </p>
              <BoltIcon className="sm:w-4 sm:h-4 w-3 h-3 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-5">
              <span className="bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
                Smarter
              </span>{" "}
              <span className="text-base-content">Classifications,</span>
              <br />
              <span className="bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
                Effortless
              </span>{" "}
              <span className="text-base-content">Tariffs</span>
            </h1>

            <p className="text-base text-base-content/80 md:text-lg max-w-3xl mx-auto mb-8">
              Classify quicker, find the latest duty & tariffs for any import,
              and avoid surprise fees
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 w-full">
              {/* Get Started Button with Popover */}
              <div className="relative w-full sm:w-auto">
                <button
                  onClick={() => setIsToolMenuOpen(!isToolMenuOpen)}
                  className="group inline-flex items-center justify-center gap-2  px-16 py-3.5 rounded-xl font-semibold text-base bg-primary text-white hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                >
                  <span>Get Started</span>
                  <svg
                    className={`w-5 h-5 transition-transform duration-300 ${isToolMenuOpen ? "" : "-rotate-180"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Tool Selection Popover */}
                {isToolMenuOpen && (
                  <>
                    {/* Backdrop to close menu */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsToolMenuOpen(false)}
                    />
                    {/* Popover Menu */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50 w-72 sm:w-80 bg-base-100 rounded-2xl shadow-2xl border border-base-content/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* Arrow */}
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-base-100 border-l border-t border-base-content/10 rotate-45" />

                      <div className="relative p-2">
                        <p className="text-xs font-medium text-base-content/50 uppercase tracking-wider px-3 py-2">
                          Choose a tool
                        </p>

                        <Link
                          href="/classifications"
                          onClick={() => setIsToolMenuOpen(false)}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/10 transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                            🎯
                          </div>
                          <div className="flex flex-col">
                            <div className="text-left font-semibold text-base-content group-hover:text-secondary transition-colors">
                              Classification Assistant
                            </div>
                            <div className="text-left text-xs text-base-content/60">
                              AI-powered classification assistance
                            </div>
                          </div>
                        </Link>

                        <Link
                          href="/duty-calculator"
                          onClick={() => setIsToolMenuOpen(false)}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/10 transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                            💰
                          </div>
                          <div className="flex flex-col">
                            <div className="text-left font-semibold text-base-content group-hover:text-primary transition-colors">
                              Duty & Tariff Calculator
                            </div>
                            <div className="text-left text-xs text-base-content/60">
                              Duties & tariffs for any import
                            </div>
                          </div>
                        </Link>

                        <Link
                          href="/tariffs/impact-checker"
                          onClick={() => setIsToolMenuOpen(false)}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/10 transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                            ✓
                          </div>
                          <div className="flex flex-col">
                            <div className="text-left font-semibold text-base-content">
                              Tariff Impact Checker
                            </div>
                            <div className="text-left text-xs text-base-content/60">
                              Check if new tariffs affect your imports
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={handleBookDemoClick}
                className="inline-flex items-center gap-2 px-8 py-2 sm:py-3.5 rounded-xl font-semibold text-base text-primary border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
              >
                Book Demo
              </button>
            </div>
          </div>

          {/* Product Steps Visual */}
          {/* <ProductStepsVisual products={productSections} /> */}

          {/* Integrated Testimonials Strip */}
          <TestimonialsStrip />
        </div>
      </div>

      {/* Full-Page Product Sections */}
      <div
        id="tools"
        className="w-full flex flex-col bg-gradient-to-r from-primary/10 via-transparent to-secondary/5"
      >
        {/* Header */}
        <div className="w-full flex flex-col max-w-5xl mx-auto text-center gap-6 py-12 md:py-24 px-4">
          {/* Main Headline */}
          <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-center leading-tight">
            <span className="bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
              Powerful Tools
            </span>{" "}
            for US Importers
          </h2>

          {/* Value Proposition */}
          {/* <p className="text-base-content/70 text-base md:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed"> */}
          {/* Designed to save time and unlock savings for trade professionals */}
          {/* Cut classification time, get instant duty quotes, and stay ahead of
            tariff changes */}
          {/* </p> */}

          {/* Audience Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
            <span className="inline-flex items-center px-3 py-1 sm:py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs sm:text-sm font-medium text-primary">
              Customs Brokerages
            </span>
            <span className="inline-flex items-center px-3 py-1 sm:py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-xs sm:text-sm font-medium text-secondary">
              Manufacturers
            </span>
            <span className="inline-flex items-center px-3 py-1 sm:py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs sm:text-sm font-medium text-primary">
              Freight Forwarders
            </span>
            <span className="inline-flex items-center px-3 py-1 sm:py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-xs sm:text-sm font-medium text-secondary">
              Logistic Teams
            </span>
            <span className="inline-flex items-center px-3 py-1 sm:py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs sm:text-sm font-medium text-primary">
              Ecommerce Brands
            </span>
          </div>

          {/* Scroll hint */}
          <div className="flex items-center justify-center gap-4 text-base-content/40 pt-4">
            <svg
              className="w-4 h-4 animate-bounce"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
            <span className="text-sm font-medium">Explore Our Tools</span>
            <svg
              className="w-4 h-4 animate-bounce"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
        {productSections.map((product, index) => (
          <ProductSection key={product.title} product={product} index={index} />
        ))}
      </div>

      <UseCases handleBookDemoClick={handleBookDemoClick} />

      <Pricing customerType={AboutPage.BUNDLE} />
      <FAQ faqItems={bundleFaqList} />
      <Footer />

      <LetsTalkModal
        isOpen={isBookDemoModalOpen}
        onClose={() => setIsBookDemoModalOpen(false)}
      />
    </div>
  );
}
