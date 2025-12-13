"use client";

import Link from "next/link";
import Image from "next/image";
import { Suspense, useState, useEffect, useCallback } from "react";
import LetsTalkModal from "../components/LetsTalkModal";
import { useUser } from "../contexts/UserContext";
import { AboutPage } from "../enums/classify";
import { MixpanelEvent, trackEvent } from "../libs/mixpanel";
import LandingHeader from "../components/LandingHeader";
import Pricing from "../components/Pricing";
import {
  ProductSection,
  ProductSectionData,
} from "../components/ProductSection";
import TestimonialsStrip from "../components/TestimonialsStrip";
import { FAQ } from "../components/FAQ";
import { bundleFaqList } from "../constants/faq";
import Footer from "../components/Footer";
import UseCases from "../components/UseCases";

const heroImages = [
  {
    id: "tariffs",
    src: "/hero-tariffs.png",
    srcMobile: "/hero-tariffs-mobile.png",
    label: "Duty Calculator",
    tagline: "Duty & Tariffs Calculator",
  },
  {
    id: "classify",
    src: "/hero-classify.png",
    srcMobile: "/hero-classify-mobile.png",
    label: "Classification",
    tagline: "AI-powered Classification Assistant",
  },
];

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
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Auto-rotate hero images every 4 seconds
  const nextImage = useCallback(() => {
    setActiveImageIndex((prev) => (prev + 1) % heroImages.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextImage, 7000);
    return () => clearInterval(interval);
  }, [nextImage]);

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

        <div className="relative z-10 flex flex-col items-center px-4 sm:px-6 py-12 md:py-16 lg:py-20">
          {/* Main Hero Content */}
          <div className="text-center max-w-4xl w-full">
            {/* Compact Trust Indicator */}
            {/* <div className="flex items-center justify-center gap-2 mb-12">
              <BoltIcon className="sm:w-4 sm:h-4 w-3 h-3 text-primary shrink-0" />
              <p className="text-sm font-medium sm:hidden px-4 sm:px-0">
                Save Hours On HTS Classifications,
                <br /> Tariff Checks, & Duty Quotes
              </p>
              <p className="text-sm font-medium hidden sm:block">
                Save Hours On HTS Classifications, Duty Quotes, & Tariff Checks
              </p>
              <BoltIcon className="sm:w-4 sm:h-4 w-3 h-3 text-primary shrink-0" />
            </div> */}
            {/* Social Credibility */}
            {/* <div className="flex items-center justify-center gap-2 mb-10 text-base-content/60">
              <span className="text-amber-400 text-lg">★</span>
              <p className="text-sm">
                Trusted by customs brokers & logistics teams like{" "}
                <span className="font-semibold text-base-content/80">K+N</span>,{" "}
                <span className="font-semibold text-base-content/80">DSV</span>,
                &{" "}
                <span className="font-semibold text-base-content/80">
                  Amazon
                </span>
              </p>
            </div> */}

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-5">
              <span className="bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
                Effortless
              </span>{" "}
              <span className="text-base-content">Tariffs,</span>
              <br />
              <span className="bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
                Quicker
              </span>{" "}
              <span className="text-base-content">Classifications</span>
              <br />
            </h1>

            <p className="text-sm sm:text-base text-base-content/80 md:text-lg max-w-3xl mx-auto mb-8">
              Classify quickly with confidence & find the latest duty & tariffs
              for any import
              {/* Save Hours On HTS Classifications, Duty Quotes, & Tariff Checks */}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
              {/* Get Started Button with Popover */}
              <div className="relative w-full sm:w-auto">
                <button
                  onClick={() => setIsToolMenuOpen(!isToolMenuOpen)}
                  className="group inline-flex items-center justify-center gap-2 px-16 sm:px-28 py-2.5 sm:py-3.5 rounded-xl font-semibold text-base bg-primary text-white hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                >
                  <span>Try Now</span>
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

          {/* Hero Image Showcase */}
          <div className="w-full max-w-5xl mx-auto mt-6 md:mt-8">
            {/* Image Container with Glow Effect */}
            <div className="relative">
              {/* Glow background */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-3xl blur-2xl opacity-60" />

              {/* Main image frame */}
              <div className="relative bg-base-200/50 rounded-2xl shadow-2xl border border-base-content/10 overflow-hidden">
                {/* Image wrapper with aspect ratio - taller on mobile */}
                <div className="relative aspect-[11/13] sm:aspect-[16/8] w-full">
                  {heroImages.map((image, index) => (
                    <div
                      key={image.id}
                      className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                        index === activeImageIndex
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-[1.02]"
                      }`}
                    >
                      {/* Mobile image */}
                      <Image
                        src={image.srcMobile}
                        alt={image.label}
                        fill
                        className="object-cover sm:hidden"
                        priority={index === 0}
                      />
                      {/* Desktop image */}
                      <Image
                        src={image.src}
                        alt={image.label}
                        fill
                        className="object-cover hidden sm:block"
                        priority={index === 0}
                      />
                    </div>
                  ))}
                </div>

                {/* Bottom bar with tabs - hidden on mobile */}
                <div className="hidden md:block absolute bottom-0 left-0 right-0 bg-gradient-to-t from-base-100 via-base-100/95 to-transparent pt-12 pb-4 px-4">
                  <div className="flex items-center justify-center gap-2">
                    {heroImages.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setActiveImageIndex(index)}
                        className={`group flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                          index === activeImageIndex
                            ? "bg-primary text-white shadow-lg shadow-primary/25"
                            : "bg-base-200/80 text-base-content/70 hover:bg-base-300/80 hover:text-base-content"
                        }`}
                      >
                        {/* <span className="text-sm">{image.emoji}</span> */}
                        <span className="text-sm font-medium">
                          {image.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Active image tagline */}
            <p className="text-center text-sm text-base-content/60 mt-4 transition-all duration-300">
              {heroImages[activeImageIndex].tagline}
            </p>
          </div>
        </div>
      </div>

      {/* Testimonials Section - fades in on scroll */}
      <div className={`w-full px-4 sm:px-6 pb-12 pt-0 bg-base-100`}>
        <TestimonialsStrip />
      </div>

      {/* Full-Page Product Sections */}
      <div
        id="tools"
        className="w-full flex flex-col bg-gradient-to-r from-primary/10 via-transparent to-secondary/5"
      >
        {/* Header */}
        <div className="relative w-full flex flex-col max-w-5xl mx-auto text-center gap-4 py-16 md:py-24 px-4">
          {/* Subtle badge */}
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-base-100 border border-base-content/10 text-xs font-medium text-base-content/60 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Built for Trade Professionals
            </span>
          </div>
          {/* Main Headline */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
            <span className="text-base-content">Your</span>{" "}
            <span className="bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
              Toolkit
            </span>{" "}
            For Smooth Imports
          </h2>{" "}
          {/* Subtext */}
          <p className="text-base-content/60 text-sm sm:text-base max-w-xl mx-auto">
            From classification to duty calculation and tarrifs — we&apos;ve got
            you covered
          </p>
          {/* Audience Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 pt-2">
            <span className="inline-flex items-center px-3 py-1 sm:py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs sm:text-sm font-medium text-primary">
              Customs Brokers
            </span>
            <span className="inline-flex items-center px-3 py-1 sm:py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-xs sm:text-sm font-medium text-secondary">
              Freight Forwarders
            </span>
            <span className="inline-flex items-center px-3 py-1 sm:py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs sm:text-sm font-medium text-primary">
              Manufacturers
            </span>
          </div>
          {/* Scroll indicator */}
          <div className="flex justify-center pt-4">
            <svg
              className="w-5 h-5 text-base-content/40 animate-bounce"
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
