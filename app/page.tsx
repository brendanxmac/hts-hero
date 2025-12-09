"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import LetsTalkModal from "../components/LetsTalkModal";
import Pricing from "../components/Pricing";
import { useUser } from "../contexts/UserContext";
import { AboutPage } from "../enums/classify";
import { MixpanelEvent, trackEvent } from "../libs/mixpanel";

interface ProductCardI {
  emoji: string;
  title: string;
  description: string;
  aboutUrl: string;
  appUrl: string;
  cta: string;
}

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
    title: "Tariff Finder",
    tagline: "Find the Best Rate",
    description:
      "Stop guessing at tariff rates. Instantly see the complete tariff breakdown for any HTS code from nearly 200 countries—including automatic tariff stacking, exemptions, and trade programs.",
    features: [
      {
        icon: "🌍",
        title: "Global Coverage",
        description:
          "See tariff rates for imports from ~200 countries with a single search",
      },
      {
        icon: "📊",
        title: "Smart Stacking",
        description:
          "Automatically calculates cumulative tariffs from all applicable programs",
      },
      {
        icon: "💡",
        title: "Discover Savings",
        description:
          "Surface exemptions and trade programs you might be eligible for",
      },
      {
        icon: "⚡",
        title: "Always Current",
        description: "Updated with the latest tariff announcements and changes",
      },
    ],
    aboutUrl: "/about/tariffs",
    appUrl: "/tariff-finder",
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
    tagline: "Classify Smarter, Not Harder",
    description:
      "Turbocharge your HTS classifications with AI-powered candidate suggestions, GRI analysis, cross-rulings validation, and one-click professional reports.",
    features: [
      {
        icon: "🤖",
        title: "AI Candidates",
        description:
          "Get intelligent HS heading suggestions for any product description",
      },
      {
        icon: "📋",
        title: "GRI Analysis",
        description:
          "Automatic best-fit analysis at every classification level",
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
          "Generate branded, professional classification reports instantly",
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
    tagline: "Never Be Surprised Again",
    description:
      "Paste your HTS codes and instantly see which imports are affected by the latest tariff announcements. Get notified before changes hit your bottom line.",
    features: [
      {
        icon: "🔔",
        title: "Instant Alerts",
        description:
          "Get notified when new tariffs affect any of your tracked codes",
      },
      {
        icon: "📦",
        title: "Bulk Checking",
        description:
          "Check hundreds of HTS codes against any tariff announcement at once",
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
    accentColor: "accent",
    media: {
      src: "/tariff-impact-demo.mp4",
      type: "video",
    },
  },
];

const products: ProductCardI[] = [
  {
    emoji: "💰",
    title: "Tariff Finder",
    description: "Find the Best Tariff Rate for Any Item",
    aboutUrl: "/about/tariffs",
    appUrl: "/tariff-finder",
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
    company: "DEX Global",
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
function ProductCard({
  emoji,
  title,
  description,
  aboutUrl,
  appUrl,
  cta,
}: ProductCardI) {
  return (
    <div className="group relative overflow-hidden w-full h-auto py-8 px-6 max-w-lg lg:max-w-none mx-auto lg:mx-0 bg-gradient-to-br from-base-200/80 via-base-100 to-base-200/60 border border-base-content/10 rounded-2xl shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:-translate-y-1">
      {/* Decorative gradient orb */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10 flex flex-col items-center gap-5">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 text-4xl shadow-sm">
          {emoji}
        </div>
        <div className="flex flex-col gap-2 text-center">
          <h3 className="text-xl font-bold text-base-content">{title}</h3>
          <p className="text-sm text-base-content/60 leading-relaxed">
            {description}
          </p>
        </div>
        <div className="flex flex-col gap-4 mt-2 w-full items-center">
          <Link
            href={appUrl}
            className="group/btn inline-flex items-center justify-center gap-2 w-full max-w-xs px-6 py-3 rounded-xl font-semibold text-sm bg-primary text-white hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
          >
            <span>{cta}</span>
            <svg
              className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-0.5"
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
          <Link
            href={aboutUrl}
            className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
}

// Company Badge Component
function CompanyBadge({ company }: { company: string }) {
  return (
    <div className="flex items-center justify-center px-4 py-2 rounded-lg bg-base-200/60 border border-base-content/10 text-base-content/70 font-medium text-sm whitespace-nowrap transition-all duration-300 hover:border-base-content/20 hover:bg-base-200">
      {company}
    </div>
  );
}

// Testimonial Card Component
function TestimonialCard({
  testimonial,
}: {
  testimonial: (typeof testimonials)[0];
}) {
  return (
    <div className="relative overflow-hidden flex flex-col items-center text-center w-full sm:flex-1 sm:max-w-sm lg:max-w-md bg-gradient-to-br from-base-200/80 via-base-100 to-base-200/60 backdrop-blur-sm rounded-2xl p-6 border border-base-content/10 transition-all duration-300 hover:border-primary/20 hover:shadow-lg">
      {/* Decorative quote mark */}
      <div className="absolute top-4 left-4 text-6xl text-primary/10 font-serif leading-none">
        &ldquo;
      </div>

      <blockquote className="relative z-10 text-base md:text-lg text-base-content/90 mb-5 font-semibold leading-relaxed">
        &quot;{testimonial.quote}&quot;
      </blockquote>
      <div className="flex flex-col gap-1">
        <div className="text-xs font-bold uppercase tracking-wider text-primary">
          {testimonial.role}
        </div>
        <div className="text-xs text-base-content/50">
          {testimonial.company}
        </div>
      </div>
    </div>
  );
}

// Full-page Product Section Component
function ProductSection({
  product,
  index,
}: {
  product: ProductSectionData;
  index: number;
}) {
  const isEven = index % 2 === 0;

  // Dynamic accent colors based on product
  const accentColorClasses = {
    primary: {
      gradient: "from-primary/10 via-primary/5 to-transparent",
      border: "border-primary/20",
      bg: "bg-primary",
      text: "text-primary",
      hoverBorder: "hover:border-primary/40",
      featureBg: "from-primary/20 to-primary/5",
      featureBorder: "border-primary/20",
      orb1: "bg-primary/10",
      orb2: "bg-primary/5",
    },
    secondary: {
      gradient: "from-secondary/10 via-secondary/5 to-transparent",
      border: "border-secondary/20",
      bg: "bg-secondary",
      text: "text-secondary",
      hoverBorder: "hover:border-secondary/40",
      featureBg: "from-secondary/20 to-secondary/5",
      featureBorder: "border-secondary/20",
      orb1: "bg-secondary/10",
      orb2: "bg-secondary/5",
    },
    accent: {
      gradient: "from-accent/10 via-accent/5 to-transparent",
      border: "border-accent/20",
      bg: "bg-accent",
      text: "text-accent",
      hoverBorder: "hover:border-accent/40",
      featureBg: "from-accent/20 to-accent/5",
      featureBorder: "border-accent/20",
      orb1: "bg-accent/10",
      orb2: "bg-accent/5",
    },
  };

  const colors = accentColorClasses[product.accentColor];

  return (
    <section className={`relative overflow-hidden py-20 md:py-28 bg-base-100`}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute ${
            isEven ? "-top-40 -right-40" : "-top-40 -left-40"
          } w-80 h-80 ${colors.orb1} rounded-full blur-3xl`}
        />
        <div
          className={`absolute ${
            isEven ? "-bottom-40 -left-40" : "-bottom-40 -right-40"
          } w-80 h-80 ${colors.orb2} rounded-full blur-3xl`}
        />
        {/* Subtle pattern */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center`}
        >
          {/* Content Side */}
          <div className={`${isEven ? "lg:order-1" : "lg:order-2"}`}>
            {/* Emoji badge */}
            <div
              className={`inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r ${colors.gradient} border ${colors.border} mb-6`}
            >
              <span className="text-2xl">{product.emoji}</span>
              <span
                className={`text-sm font-semibold ${colors.text} uppercase tracking-wider`}
              >
                {product.tagline}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-base-content mb-4">
              {product.title}
            </h2>

            {/* Description */}
            <p className="text-base md:text-lg text-base-content/70 leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {product.features.map((feature) => (
                <div
                  key={feature.title}
                  className={`group p-4 rounded-xl bg-gradient-to-br ${colors.featureBg} border ${colors.featureBorder} transition-all duration-300 ${colors.hoverBorder}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">
                      {feature.icon}
                    </span>
                    <div>
                      <h4 className="font-bold text-base-content mb-1">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-base-content/60 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={product.appUrl}
                className={`group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-base ${colors.bg} text-white hover:opacity-90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl`}
              >
                <span>{product.cta}</span>
                <svg
                  className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5"
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
              <Link
                href={product.aboutUrl}
                className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-base ${colors.text} border-2 ${colors.border} ${colors.hoverBorder} hover:bg-base-200/50 transition-all duration-200`}
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Media/Visual Side */}
          <div className={`${isEven ? "lg:order-2" : "lg:order-1"}`}>
            <div
              className={`relative rounded-2xl overflow-hidden border-2 ${colors.border} shadow-2xl`}
            >
              {/* Gradient overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-tr ${colors.gradient} opacity-40 z-10 pointer-events-none`}
              />
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
      {/* <Suspense
        fallback={
          <div className="h-16 bg-base-100 border-b border-base-content/20" />
        }
      >
        {user ? <AuthenticatedHeader /> : <UnauthenticatedHeader />}
      </Suspense> */}

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-base-200 via-base-100 to-base-100">
        {/* Background elements - simplified for cleaner hero */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-16 md:py-24 lg:py-32">
          <div className="text-center max-w-4xl w-full">
            {/* Hero Content */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
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

            <p className="text-base-content/60 text-base md:text-lg lg:text-xl max-w-2xl mx-auto mb-10">
              The all-in-one platform for trade professionals to master HTS
              classifications and navigate tariffs with confidence.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="#pricing"
                className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-base bg-primary text-white hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                <span>Buy Now</span>
                <svg
                  className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5"
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
              <button
                onClick={handleBookDemoClick}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-base text-primary border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
              >
                Book Demo
              </button>
            </div>

            {/* Product Cards - commented out for reference */}
            {/* <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto mb-12 md:mb-16">
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
            </div> */}
          </div>
        </div>
      </div>

      {/* Full-Page Product Sections */}
      {productSections.map((product, index) => (
        <ProductSection key={product.title} product={product} index={index} />
      ))}

      {/* Trusted By Section */}
      <section className="relative overflow-hidden py-14 md:py-20 bg-base-100 border-t border-base-content/5">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center flex flex-col gap-8">
            {/* Header */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary/80">
                <span className="w-8 h-px bg-primary/40" />
                Trusted By Industry Leaders
                <span className="w-8 h-px bg-primary/40" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-base-content">
                Join Hundreds of{" "}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Trade Professionals
                </span>
              </h2>
              <p className="text-base-content/60 text-sm md:text-base max-w-2xl mx-auto">
                Who use HTS Hero to make tariffs & classification a breeze
              </p>
            </div>

            {/* Company Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {companies.map((company, index) => (
                <CompanyBadge key={`company-${index}`} company={company} />
              ))}
            </div>

            {/* Testimonials */}
            <div className="mt-8">
              <div className="flex flex-wrap justify-center items-stretch gap-6 md:gap-8">
                {testimonials.map((testimonial, index) => (
                  <TestimonialCard key={index} testimonial={testimonial} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <Pricing customerType={AboutPage.CLASSIFIER} />

      <LetsTalkModal
        isOpen={isBookDemoModalOpen}
        onClose={() => setIsBookDemoModalOpen(false)}
      />
    </div>
  );
}
