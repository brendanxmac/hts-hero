"use client";

import Link from "next/link";
import Image from "next/image";
import { Suspense, useState, useEffect, useCallback } from "react";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
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
import { CTABanner } from "./CTABanner";
import ClassifyPricing from "./ClassifyPricing";
import ClassificationExamplesSection from "./ClassificationExamplesSection";

function YouTubeEmbed({
  videoId,
  title,
}: {
  videoId: string;
  title: string;
}) {
  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-base-content/10 bg-base-200">
      <iframe
        className="absolute inset-0 w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  );
}

const heroImages = [
  {
    id: "tariffs",
    src: "/hero-tariffs.png",
    srcMobile: "/hero-tariffs-mobile.png",
    label: "Duty Simulator",
    tagline: "Duty & Tariffs Simulator",
  },
  {
    id: "classify",
    src: "/hero-classify.png",
    srcMobile: "/hero-classify-mobile.png",
    label: "Classification",
    tagline: "AI-Assisted Classification",
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
    aboutUrl: "/classify",
    appUrl: "/classifications/new",
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

export function HomePage() {
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
      {/* <CTABanner
        message={`Produce HTS classifications that avoid audits, in minutes`}
        ctaText="Book Demo"
        onClick={handleBookDemoClick}
      /> */}
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
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-7">
              <span className="text-primary">
                Flawless
              </span>{" "} Classifications, <br /> in <span className="text-primary">Half</span> the Time
            </h1>
            {/* <p className="text-sm sm:text-base text-base-content/80 md:text-lg max-w-4xl mx-auto mb-8">
              Quickly produce HTS classifications that contain legal note and CROSS ruling evdience
            </p> */}

            {/* Primary CTA - always visible above the fold on every screen size */}
            <div className="flex flex-col items-center justify-center gap-3 w-full">
              <button
                onClick={handleBookDemoClick}
                className="group inline-flex items-center justify-center gap-2 px-10 sm:px-14 py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg bg-primary text-primary-content hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/30 hover:shadow-xl"
              >
                <span>Book a Demo</span>
                <ArrowRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
              </button>
              <p className="text-xs sm:text-sm text-base-content/60">
                See it live in 30 minutes &middot; No commitment
              </p>
            </div>

          </div>

          {/* Hero Demo Video */}
          <div className="w-full max-w-4xl mx-auto mt-10 md:mt-12">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-3xl blur-2xl opacity-60" />
              <div className="relative">
                <YouTubeEmbed
                  videoId="Us51cwwakH8"
                  title="HTS Hero product demo"
                />
              </div>
            </div>
          </div>

          {/* Testimonials Section - fades in on scroll */}
          <div className={`w-full px-4 sm:px-6 pt-6 md:pt-10 bg-base-100`}>
            <TestimonialsStrip />
          </div>
        </div>
      </div>

      {/* Conversion CTA Section - below testimonials */}
      {/* <section className="relative overflow-hidden border-y border-base-content/10 bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-16 md:py-20 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4">
            See HTS Hero on{" "}
            <span className="text-primary">Your Products</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-base-content/70 max-w-2xl mx-auto mb-8">
            In a quick 30-minute call we&apos;ll walk through your real
            classifications, show you how teams cut their workload in half, and
            answer every question.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-8">
            {[
              "Tailored to your workflow",
              "No commitment",
              "Live Q&A",
            ].map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-2 text-sm font-medium text-base-content/70"
              >
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/15 text-primary">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                {item}
              </span>
            ))}
          </div>

          <button
            onClick={handleBookDemoClick}
            className="group inline-flex items-center justify-center gap-2 px-10 sm:px-14 py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg bg-primary text-primary-content hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/30 hover:shadow-xl"
          >
            <span>Book a Demo</span>
            <ArrowRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </section> */}

      <ClassificationExamplesSection />

      <UseCases handleBookDemoClick={handleBookDemoClick} />

      {/* Trade Pros Deserve Better - video section above FAQ */}
      <section className="relative overflow-hidden bg-base-100">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-radial from-secondary/5 to-transparent rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pb-16 md:pb-24">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-4">
              Trade Pros Deserve{" "}
              <span className="text-primary">
                Better
              </span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-base-content/70 max-w-2xl mx-auto">
              See why customs brokers and trade teams are switching to HTS Hero.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-secondary/20 via-primary/20 to-secondary/20 rounded-3xl blur-2xl opacity-60" />
            <div className="relative">
              <YouTubeEmbed
                videoId="yDg86gTQebA"
                title="Trade Pros Deserve Better"
              />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 mt-10">
            <button
              onClick={handleBookDemoClick}
              className="group inline-flex items-center justify-center gap-2 px-10 sm:px-14 py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg bg-primary text-primary-content hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/30 hover:shadow-xl"
            >
              <span>Book a Demo</span>
              <ArrowRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
            </button>
            <p className="text-xs sm:text-sm text-base-content/60">
              See it live in 30 minutes &middot; No commitment
            </p>
          </div>
        </div>
      </section>

      <ClassifyPricing customerType={AboutPage.CLASSIFIER} />

      <FAQ faqItems={bundleFaqList} />
      <Footer />

      <LetsTalkModal
        isOpen={isBookDemoModalOpen}
        onClose={() => setIsBookDemoModalOpen(false)}
      />
    </div>
  );
}
