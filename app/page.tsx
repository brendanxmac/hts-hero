"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useState } from "react";
import LetsTalkModal from "../components/LetsTalkModal";
import { useUser } from "../contexts/UserContext";
import { AboutPage } from "../enums/classify";
import { MixpanelEvent, trackEvent } from "../libs/mixpanel";
import LandingHeader from "../components/LandingHeader";
import Pricing from "../components/Pricing";
import { BoltIcon } from "@heroicons/react/24/solid";

// Extended product data for full-page sections
interface ProductSectionData {
  emoji: string;
  title: string;
  tagline: string;
  description: string;
  features: {
    icon: string;
    title: string;
    description: string;
  }[];
  aboutUrl: string;
  appUrl: string;
  cta: string;
  accentColor: "primary" | "secondary" | "accent";
  media: {
    src: string;
    type: "image" | "video";
  };
}

const productSections: ProductSectionData[] = [
  {
    emoji: "💰",
    title: "Duty Calculator",
    tagline: "Master Tariffs & Discover Savings",
    description:
      "See the complete tariff & fees breakdown for any US import and discover ways to save with exemptions and special trade programs.",
    features: [
      {
        icon: "🌍",
        title: "Know your Costs",
        description:
          "See the landed cost, duty rates, and itemized tariffs for any import from any country",
      },
      // {
      //   icon: "📊",
      //   title: "Smart Stacking",
      //   description:
      //     "Skip the math & see the final tariff rates with tariff stacking rules applied",
      // },
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
      "Turbocharge your HTS classifications with AI-powered candidate discovery, GRI analysis, cross-rulings validation, and branded reports.",
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
    cta: "Start Classifying",
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

const products: ProductCardI[] = [
  {
    emoji: "💰",
    title: "Duty Calculator",
    description: "Find the Best Tariff Rate for Any Item",
    aboutUrl: "/about/tariffs",
    appUrl: "/duty-calculator",
    cta: "Find Tariffs",
  },
  {
    emoji: "🎯",
    title: "Classification Assistant",
    description: "Turbocharge Your Classifications",
    aboutUrl: "/about",
    appUrl: "/classifications",
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

// Company names data
const companies = [
  "Amazon",
  "Kuehne + Nagel",
  "DSV",
  "Border Brokers",
  "Harren Group",
  "JORI Logistics",
  "Ingersoll Rand",
  "True North Brokerage",
];

// Individual testimonials
const testimonials = [
  {
    role: "Vice President, LCB",
    company: "DEX Globfal",
    quote: "I don't know how you do it, but I am glad I have my HTS Hero!",
  },
  {
    role: "Director of Operations & Compliance, LCB",
    company: "Harren Group",
    quote:
      "I was really pleased with the AI recommendation – it was very intuitive and caught something I hadn't seen earlier",
  },
  {
    role: "VP Forwarding & Customs Brokerage",
    company: "Logisteed America",
    quote:
      "Been loving using htshero. Excellent tool and fun watching you develop this.",
  },
];

// Product Card Component
// function ProductCard({
//   emoji,
//   title,
//   description,
//   aboutUrl,
//   appUrl,
//   cta,
// }: ProductCardI) {
//   return (
//     <div className="group relative overflow-hidden w-full h-auto py-8 px-6 max-w-lg lg:max-w-none mx-auto lg:mx-0 bg-gradient-to-br from-base-200/80 via-base-100 to-base-200/60 border border-base-content/10 rounded-2xl shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:-translate-y-1">
//       {/* Decorative gradient orb */}
//       <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

//       <div className="relative z-10 flex flex-col items-center gap-5">
//         <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 text-4xl shadow-sm">
//           {emoji}
//         </div>
//         <div className="flex flex-col gap-2 text-center">
//           <h3 className="text-xl font-bold text-base-content">{title}</h3>
//           <p className="text-sm text-base-content/60 leading-relaxed">
//             {description}
//           </p>
//         </div>
//         <div className="flex flex-col gap-4 mt-2 w-full items-center">
//           <Link
//             href={appUrl}
//             className="group/btn inline-flex items-center justify-center gap-2 w-full max-w-xs px-6 py-3 rounded-xl font-semibold text-sm bg-primary text-white hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
//           >
//             <span>{cta}</span>
//             <svg
//               className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-0.5"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//               strokeWidth={2.5}
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 d="M13 7l5 5m0 0l-5 5m5-5H6"
//               />
//             </svg>
//           </Link>
//           <Link
//             href={aboutUrl}
//             className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
//           >
//             Learn More
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }

// Full-page Product Section Component
function ProductSection({
  product,
  index,
}: {
  product: ProductSectionData;
  index: number;
}) {
  const isEven = index % 2 === 0;

  // Simplified color scheme - use primary for all, keep it clean
  const accentColorClasses = {
    primary: {
      bg: "bg-primary",
      text: "text-primary",
      border: "border-primary/20",
      hoverBorder: "hover:border-primary/30",
    },
    secondary: {
      bg: "bg-secondary",
      text: "text-secondary",
      border: "border-secondary/20",
      hoverBorder: "hover:border-secondary/30",
    },
    accent: {
      bg: "bg-accent",
      text: "text-accent",
      border: "border-accent/20",
      hoverBorder: "hover:border-accent/30",
    },
  };

  const colors = accentColorClasses[product.accentColor];

  return (
    <section
      className={`relative py-16 md:py-24 ${
        isEven ? "bg-base-100" : "bg-base-200/50"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center`}
        >
          {/* Content Side */}
          <div className={`${isEven ? "lg:order-1" : "lg:order-2"}`}>
            {/* Section label */}
            <div className="flex items-center gap-2 mb-4">
              <span className={`inline-block w-8 h-px ${colors.bg}`} />
              <span
                className={`text-xs font-semibold ${colors.text} uppercase tracking-widest`}
              >
                {product.tagline}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-base-content mb-4">
              {product.title}
            </h2>

            {/* Description */}
            <p className="text-base text-base-content/60 leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Features List - cleaner vertical list */}
            <ul className="space-y-3 mb-8">
              {product.features.map((feature) => (
                <li key={feature.title} className="flex items-start gap-3">
                  <svg
                    className={`w-5 h-5 ${colors.text} flex-shrink-0 mt-0.5`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <div>
                    <span className="font-medium text-base-content">
                      {feature.title}
                    </span>
                    <span className="text-base-content/50"> — </span>
                    <span className="text-base-content/60">
                      {feature.description}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={product.appUrl}
                className={`group inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm ${colors.bg} text-white hover:opacity-90 transition-all duration-200 shadow-sm hover:shadow-md`}
              >
                <span>{product.cta}</span>
                <svg
                  className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
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
              </Link>
              <Link
                href={product.aboutUrl}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm ${colors.text} hover:bg-base-200 transition-colors duration-200`}
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Media/Visual Side */}
          <div className={`${isEven ? "lg:order-2" : "lg:order-1"}`}>
            <div
              className={`relative rounded-xl overflow-hidden border ${colors.border} shadow-lg bg-base-200`}
            >
              {product.media.type === "video" ? (
                <video
                  src={product.media.src}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto object-cover"
                  aria-label={product.title}
                />
              ) : (
                <Image
                  src={product.media.src}
                  alt={product.title}
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

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

        <div className="relative z-10 flex flex-col items-center px-4 sm:px-6 py-4 md:pt-20 lg:pt-24">
          {/* Main Hero Content */}
          <div className="text-center max-w-4xl w-full mb-4">
            {/* Compact Trust Indicator */}
            <div className="flex items-center justify-center gap-2 mb-12">
              <BoltIcon className="w-4 h-4 text-primary" />
              <p className="text-sm font-medium">
                Saving Manufacturers, Brokerages, & 3PL's Hours Every Week
              </p>
              <BoltIcon className="w-4 h-4 text-primary" />
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

            <p className="text-base-content/80 text-base md:text-lg max-w-4xl mx-auto mb-8">
              Classify anything in minutes, find the duty cost for any import,
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
                          href="/classify"
                          onClick={() => setIsToolMenuOpen(false)}
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/10 transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                            🎯
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-base-content group-hover:text-secondary transition-colors">
                              Classification Assistant
                            </div>
                            <div className="text-xs text-base-content/60">
                              AI-powered classification assistance
                            </div>
                          </div>
                        </Link>

                        <Link
                          href="/duty-calculator"
                          onClick={() => setIsToolMenuOpen(false)}
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-primary/10 transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                            💰
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-base-content group-hover:text-primary transition-colors">
                              Duty Calculator
                            </div>
                            <div className="text-xs text-base-content/60">
                              Duties & tariffs for any import
                            </div>
                          </div>
                        </Link>

                        <Link
                          href="/tariffs/impact-checker"
                          onClick={() => setIsToolMenuOpen(false)}
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-accent/10 transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                            ✓
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-base-content">
                              Tariff Impact Checker
                            </div>
                            <div className="text-xs text-base-content/60">
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

          {/* Integrated Testimonials Strip */}
          <div className="w-full max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="group relative bg-gradient-to-br from-primary/5 to-base-100 backdrop-blur-sm rounded-lg px-4 py-3 border border-base-content/5 hover:border-primary/20 transition-all duration-300"
                >
                  <blockquote className="text-sm text-base-content/80 leading-relaxed mb-2">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                  <div className="flex items-center gap-2">
                    <div className="text-[10px] font-semibold text-base-content/50 truncate">
                      {testimonial.role}
                    </div>
                    <span className="text-base-content/30">·</span>
                    <div className="text-[10px] text-primary/60">
                      {testimonial.company}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Company Logos Strip */}
            <div className="mt-8 pt-6 border-t border-base-content/5">
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
                <span className="text-xs font-medium text-base-content/40 uppercase tracking-wider">
                  Trusted by Trade Professionals At
                </span>
                {companies.slice(0, 6).map((company, index) => (
                  <span
                    key={`hero-company-${index}`}
                    className="text-sm font-medium text-base-content/50 hover:text-base-content/70 transition-colors"
                  >
                    {company}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Page Product Sections */}
      <div id="tools">
        {productSections.map((product, index) => (
          <ProductSection key={product.title} product={product} index={index} />
        ))}
      </div>

      {/* Pricing Section */}
      <Pricing customerType={AboutPage.BUNDLE} />

      <LetsTalkModal
        isOpen={isBookDemoModalOpen}
        onClose={() => setIsBookDemoModalOpen(false)}
      />
    </div>
  );
}
