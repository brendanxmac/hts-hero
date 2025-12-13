"use client";

import Link from "next/link";
import { Suspense } from "react";
import ClassifierFooter from "@/components/ClassifierFooter";
import { FAQ } from "@/components/FAQ";
import { tariffImpactFaqList } from "@/constants/faq";
import TariffAboutHeader from "@/components/TariffAboutHeader";
import { PendingTariffsList } from "../../../components/UpcomingTariffsList";
import TariffImpactPricing from "../../../components/TariffImpactPricing";
import TestimonialsStrip from "../../../components/TestimonialsStrip";
import {
  ProductSection,
  ProductSectionData,
} from "../../../components/ProductSection";
import { BoltIcon } from "@heroicons/react/24/solid";

// Steps for the hero section - quick overview
const heroSteps = [
  {
    step: 1,
    title: "Select Tariff Update",
    description: "Choose the tariff announcement you want to check against",
    icon: "📋",
  },
  {
    step: 2,
    title: "Enter Codes",
    description: "Select from your HTS code lists or paste codes in",
    icon: "✏️",
  },
  {
    step: 3,
    title: "See What's Affected",
    description: "Instantly see which codes are affected",
    icon: "✅",
  },
];

// Detailed product sections for below the fold
const productSections: ProductSectionData[] = [
  {
    emoji: "🔍",
    title: "Quickly See If New Tariffs Affect Your Imports",
    tagline: "See your tariff impacts",
    description:
      "Check your HTS codes against any tariff announcement in seconds.",
    features: [
      {
        icon: "⚡",
        title: "Instant Results",
        description: "Get impact results in seconds",
      },
      {
        icon: "📋",
        title: "Bulk Checking",
        description: "Check multiple HTS codes at once",
      },
      {
        icon: "✅",
        title: "Clear Status",
        description: "Instantly see which codes are affected",
      },
    ],
    aboutUrl: "/about/tariff-impact-checker",
    appUrl: "/tariffs/impact-checker",
    cta: "Try It Now",
    accentColor: "primary",
    media: {
      src: "/tariff-impact-demo.mp4",
      type: "video",
    },
  },
  {
    emoji: "💰",
    title: "See Tariff Rates & Discover Savings",
    tagline: "Cost Optimization",
    description:
      "See the full list of tariffs for any import from any country and explore ways to save on your import costs.",
    features: [
      {
        icon: "📊",
        title: "Full Rate Visibility",
        description: "See all applicable tariff rates at a glance",
      },
      {
        icon: "🌍",
        title: "Country-Specific",
        description: "Compare rates across different countries of origin",
      },
      {
        icon: "💡",
        title: "Savings Opportunities",
        description: "Identify potential ways to reduce tariff costs",
      },
    ],
    aboutUrl: "/about/tariff-impact-checker",
    appUrl: "/tariffs/impact-checker",
    cta: "Explore Savings",
    accentColor: "primary",
    media: {
      src: "/impacts-and-options.mp4",
      type: "video",
    },
  },
  {
    emoji: "🔔",
    title: "Know When Tariffs Affect Your Imports",
    tagline: "Get Notified",
    description:
      "Receive email notifications when new tariff announcements affect your imports. Stay ahead of changes and take action before they impact your bottom line.",
    features: [
      {
        icon: "📧",
        title: "Instant Alerts",
        description: "Get notified when new tariffs affect your imports",
      },
      {
        icon: "📋",
        title: "Code-Specific",
        description: "Notifications tailored to your saved HTS code lists",
      },
      {
        icon: "⚡",
        title: "Plan Ahead",
        description: "Know your costs and navigate changes with confidence",
      },
    ],
    aboutUrl: "/about/tariff-impact-checker",
    appUrl: "/tariffs/impact-checker",
    cta: "Get Started",
    accentColor: "primary",
    media: {
      src: "/notification.png",
      type: "image",
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
        <TariffAboutHeader />
      </Suspense>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-base-100">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-secondary/10 md:bg-secondary/20 rounded-full blur-3xl" />
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/10 md:bg-primary/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center px-4 sm:px-6 py-4 pt-8 md:pt-12 lg:pt-16">
          {/* Main Hero Content */}
          <div className="text-center max-w-4xl w-full mb-8">
            {/* Compact Trust Indicator */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <BoltIcon className="w-4 h-4 text-secondary" />
              <p className="text-sm font-medium">
                Stay Ahead of Tariff Changes
              </p>
              <BoltIcon className="w-4 h-4 text-secondary" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-5">
              <span className="bg-gradient-to-r from-secondary via-secondary to-primary bg-clip-text text-transparent">
                Instantly
              </span>{" "}
              See If New Tariffs Affect Your Imports
            </h1>

            <p className="text-base-content/80 text-base md:text-lg max-w-4xl mx-auto mb-8">
              Get notified, see what&apos;s affected, and discover potential
              savings
            </p>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 w-full">
              <Link
                href="/tariffs/impact-checker"
                className="group inline-flex items-center justify-center gap-2 px-16 py-3.5 rounded-xl font-semibold text-base bg-secondary text-white hover:bg-secondary/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                <span>Check your Imports!</span>
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

          {/* Steps Overview - Side by Side */}
          <div className="w-full max-w-4xl mb-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {heroSteps.map((step, index) => (
                <div
                  key={step.step}
                  className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-base-200/50 border border-base-content/10 hover:border-primary/30 transition-all duration-200"
                >
                  {/* Step number badge */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-content font-bold text-lg mb-4">
                    {step.step}
                  </div>

                  {/* Icon */}
                  {/* <span className="text-3xl mb-3">{step.icon}</span> */}

                  {/* Title */}
                  <h3 className="font-semibold text-base-content text-lg mb-2">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-base-content/60">
                    {step.description}
                  </p>

                  {/* Connector arrow (hidden on last step and mobile) */}
                  {index < heroSteps.length - 1 && (
                    <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                      <svg
                        className="w-6 h-6 text-primary/40"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Demo Video */}
          {/* <div className="w-full max-w-4xl mb-8">
            <div className="relative rounded-xl overflow-hidden border border-secondary/20 shadow-lg bg-base-200">
              <video
                src="/tariff-impact-demo.mp4"
                autoPlay
                loop
                muted
                playsInline
                controls
                controlsList="nofullscreen noplaybackrate nodownload"
                disablePictureInPicture
                className="w-full h-auto object-cover"
                aria-label="Tariff Impact Checker Demo"
              />
            </div>
          </div> */}

          {/* Testimonials Strip */}
          <TestimonialsStrip showTestimonials={false} />
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

      {/* FAQ Section */}
      <FAQ faqItems={tariffImpactFaqList} />

      {/* Pending Tariffs */}
      <PendingTariffsList />

      <ClassifierFooter />
    </div>
  );
}
