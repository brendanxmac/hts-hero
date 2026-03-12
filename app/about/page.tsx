"use client";

import Link from "next/link";
import { Suspense } from "react";
import ClassifierFooter from "../../components/ClassifierFooter";
import ClassifyPricing from "../../components/ClassifyPricing";
import { FAQ } from "../../components/FAQ";
import { classifierFaqList } from "../../constants/faq";
import { AboutPage } from "../../enums/classify";
import TestimonialsStrip from "../../components/TestimonialsStrip";
import ProductDemoSection from "../../components/ProductDemoSection";
import {
  ProductSection,
  ProductSectionData,
} from "../../components/ProductSection";
import { BoltIcon } from "@heroicons/react/24/solid";
import AboutHeader from "../../components/AboutHeader";
import { BookDemoButton } from "../../components/BookDemoButton";
import { ClassificationCTA } from "../../components/ClassificationCTA";

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
    aboutUrl: "/about",
    appUrl: "/classifications",
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
    aboutUrl: "/about",
    appUrl: "/classifications",
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
    aboutUrl: "/about",
    appUrl: "/classifications",
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
    aboutUrl: "/about",
    appUrl: "/classifications",
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
    aboutUrl: "/about",
    appUrl: "/classifications",
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
      <div className="relative overflow-hidden bg-base-100">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-secondary/10 md:bg-secondary/20 rounded-full blur-3xl" />
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/10 md:bg-primary/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center px-4 sm:px-6 py-4 pt-8 md:pt-12 lg:pt-16">
          {/* Main Hero Content */}
          <div className="text-center max-w-4xl w-full mb-4">
            {/* Compact Trust Indicator */}
            <div className="flex items-center justify-center gap-2 mb-12">
              <BoltIcon className="w-4 h-4 text-secondary" />
              <p className="text-sm font-medium">
                Saving Classifiers Hours Every Week
              </p>
              <BoltIcon className="w-4 h-4 text-secondary" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-5">
              Create <span className="bg-gradient-to-r from-secondary via-secondary to-primary bg-clip-text text-transparent">
                Audit-Ready
              </span> <br /> Classificaitons,{" "}
              <span className="bg-gradient-to-r from-secondary via-secondary to-primary bg-clip-text text-transparent">
                Fast
              </span>
            </h1>

            <p className="text-base-content/80 text-base md:text-lg max-w-4xl mx-auto mb-8">
              Save hours on classification, avoid mistakes, and work together
              with your entire team
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6 w-full">
              <Link
                href="/classifications"
                className="group inline-flex items-center justify-center gap-2 px-16 py-3.5 rounded-xl font-semibold text-base bg-secondary text-white hover:bg-secondary/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                <span>Try Now</span>
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
              <BookDemoButton />
            </div>
          </div>

          {/* Demo Video */}
          <div className="w-full max-w-4xl mb-8">
            <div className="relative rounded-xl overflow-hidden border border-secondary/20 shadow-lg bg-base-200">
              <video
                src="/new-hero-demo.mp4"
                autoPlay
                loop
                muted
                playsInline
                controls
                controlsList="nofullscreen noplaybackrate nodownload"
                disablePictureInPicture
                className="w-full h-auto object-cover"
                aria-label="Classification Assistant Demo"
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

      {/* Interactive Classification CTA */}
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <ClassificationCTA
          title="Try the Classification Assistant"
          subtitle="See how quickly you can classify a product. Enter a description and let our AI guide you."
          variant="inline"
        />
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
