"use client";

import { Suspense } from "react";
import ClassifierFooter from "../../components/ClassifierFooter";
import ClassifyPricing from "../../components/ClassifyPricing";
import { FAQ } from "../../components/FAQ";
import { classifierFaqList } from "../../constants/faq";
import { AboutPage } from "../../enums/classify";
import ProductDemoSection from "../../components/ProductDemoSection";
import {
  ProductSection,
  ProductSectionData,
} from "../../components/ProductSection";

import AboutHeader from "../../components/AboutHeader";
import { ClassifyInput } from "../../components/ClassifyInput";
import { CheckIcon } from "@heroicons/react/16/solid";

const CLASSIFY_SUPPORTING_BULLETS = [
  // "Finds Candidates",
  // "Applies GRI's & Legal Notes",
  "Results in ~1 Minute",
  // "Checks CROSS Rulings",
  // "10 Classifications FREE",
  "Generates Defense Report",
  "Share with Clients & Teammates",
];

const productSections: ProductSectionData[] = [
  {
    emoji: "🤖",
    title: "Candidates for Any Product",
    tagline: "AI-Powered Suggestions",
    description:
      "Jump-start classifications with AI suggestions. See HS heading suggestions for any item and discover headings you might have missed.",
    features: [
      {
        icon: "⚡",
        title: "Jump-Start Classifications",
        description: "Get AI suggestions for any product description",
      },
      {
        icon: "🔍",
        title: "Discover Missing Headings",
        description: "Find headings you might have overlooked",
      },
      {
        icon: "✏️",
        title: "Add Your Own",
        description: "Easily find and apply your own HS headings",
      },
      {
        icon: "⏱️",
        title: "~10 Minutes Saved",
        description: "Per classification on average",
      },
    ],
    aboutUrl: "/classify",
    appUrl: "/classifications/new",
    cta: "Try It Now",
    accentColor: "secondary",
    media: {
      src: "/get-candidates.mp4",
      type: "video",
    },
  },
  {
    emoji: "💡",
    title: "Best-Fit Analysis",
    tagline: "GRI Analysis at Every Level",
    description:
      "Get a comprehensive GRI analysis of candidates at every level to help you quickly determine the best classification.",
    features: [
      {
        icon: "📊",
        title: "GRI Analysis",
        description: "Comprehensive analysis at every classification level",
      },
      {
        icon: "🎯",
        title: "Best Candidate",
        description: "Quickly determine the best fit for your product",
      },
      {
        icon: "📝",
        title: "Add Notes",
        description: "Easily add your own notes and reasoning",
      },
      {
        icon: "⏱️",
        title: "~10 Minutes Saved",
        description: "Per classification on average",
      },
    ],
    aboutUrl: "/classify",
    appUrl: "/classifications/new",
    cta: "Analyze Now",
    accentColor: "secondary",
    media: {
      src: "/candidate-analysis.png",
      type: "image",
    },
  },
  {
    emoji: "⚖️",
    title: "Validate Against Government Rulings",
    tagline: "CROSS Rulings Integration",
    description:
      "See CROSS rulings related to your item and find out if CBP agrees with your classification.",
    features: [
      {
        icon: "📋",
        title: "Related Rulings",
        description: "See CROSS rulings related to your item",
      },
      {
        icon: "✅",
        title: "CBP Validation",
        description: "Find out if CBP agrees with your classification",
      },
      {
        icon: "⏱️",
        title: "~10 Minutes Saved",
        description: "Per classification on average",
      },
    ],
    aboutUrl: "/classify",
    appUrl: "/classifications/new",
    cta: "Validate Now",
    accentColor: "secondary",
    media: {
      src: "/cross-rulings.mp4",
      type: "video",
    },
  },
  {
    emoji: "📄",
    title: "Branded Reports, In A Single Click",
    tagline: "Professional Documentation",
    description:
      "Generate polished classification reports with your branding, notes, disclaimers, and contact info automatically included.",
    features: [
      {
        icon: "🖨️",
        title: "One-Click Reports",
        description: "Generate polished reports instantly",
      },
      {
        icon: "🎨",
        title: "Your Branding",
        description:
          "Automatically includes your branding, disclaimers, and contact info",
      },
      {
        icon: "📁",
        title: "Easy Record Keeping",
        description: "Effortless record keeping and sharing with clients",
      },
      {
        icon: "⏱️",
        title: "~20 Minutes Saved",
        description: "Per classification on average",
      },
    ],
    aboutUrl: "/classify",
    appUrl: "/classifications/new",
    cta: "Generate Report",
    accentColor: "secondary",
    media: {
      src: "/report.png",
      type: "image",
    },
  },
  {
    emoji: "👥",
    title: "Collaborate With Your Whole Team",
    tagline: "Team Collaboration",
    description:
      "See, review, and approve each other's classifications. Collaborate on classifications and track progress together.",
    features: [
      {
        icon: "👀",
        title: "Review & Approve",
        description: "See, review, and approve each other's classifications",
      },
      {
        icon: "🤝",
        title: "Collaborate",
        description: "Work together on classifications and track progress",
      },
      {
        icon: "🔍",
        title: "Search & Filter",
        description: "Search by description, status, importer, and classifier",
      },
      {
        icon: "✨",
        title: "Better Results",
        description: "Quicker classifications with fewer mistakes",
      },
    ],
    aboutUrl: "/classify",
    appUrl: "/classifications/new",
    cta: "Start Collaborating",
    accentColor: "secondary",
    media: {
      src: "/teams.png",
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
        <AboutHeader />
      </Suspense>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-base-100 h-svh content-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-secondary/10 md:bg-secondary/20 rounded-full blur-3xl" />
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/10 md:bg-primary/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center px-4 sm:px-6">
          <h1 className="text-center text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-3 md:mb-4 max-w-xs sm:max-w-5xl">
            Find Your HTS Code,{" "}
            <span className="text-secondary">
              Fast
            </span>
          </h1>

          <p className="text-center text-base-content/70 text-sm sm:text-base md:text-lg mb-8 md:mb-10 max-w-xs sm:max-w-3xl">
            Avoid expensive mistakes, save time, and eliminate import risk
          </p>

          {/* CTA input — the focal point of the page */}
          <div className="w-full max-w-3xl mx-auto mb-4 md:mb-6">
            <ClassifyInput buttonText="Find My HTS Code" />
          </div>


          {/* Supporting bullets — quiet reinforcement */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-3 gap-y-1.5 sm:gap-x-5 justify-center mb-3 sm:mb-4">
            {CLASSIFY_SUPPORTING_BULLETS.map((bullet) => (
              <div
                key={bullet}
                className="text-center font-semibold flex items-center justify-center gap-1 sm:gap-1.5 text-sm text-base-content/70"
              >
                <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-success shrink-0" />
                <span>{bullet}</span>
              </div>
            ))}
          </div>

          <p className="text-xs sm:text-sm text-center px-4 font-medium text-base-content/50">
            Trusted by Customs Brokers & Importers to Find <span className="font-extrabold">1,000+ Audit-Ready HTS Codes</span>
          </p>

          <div className="pt-10 md:pt-20 max-w-5xl">
            {/* <TestimonialsStrip showCompanies={false} /> */}
            {/* <p className="text-xs sm:text-sm text-base-content/40 text-center pt-6">
              Trusted by Customs Brokers & Importers to Create 1,000+ Audit-Ready Classifications
              </p> */}
          </div>

        </div>
      </div>


      {/* Product Sections */}
      <div id="features">
        {productSections.map((product, index) => (
          <ProductSection key={product.title} product={product} index={index} />
        ))}
      </div>

      {/* Pricing Section */}
      <ClassifyPricing customerType={AboutPage.CLASSIFIER} />

      {/* Demo Section */}
      <ProductDemoSection
        title="See How it Works"
        subtitle="A quick demo so you know exactly what you'll get"
        demoUrl="https://www.youtube.com/embed/izlXZvC-O7I?si=o6G0z0ZDhEbvIMqg"
      />

      {/* FAQ Section */}
      <FAQ faqItems={classifierFaqList} />

      <ClassifierFooter />
    </div>
  );
}
