"use client";

import { Suspense, useRef } from "react";
import ClassifierFooter from "../../components/ClassifierFooter";
import ClassifyPricing from "../../components/ClassifyPricing";
import { FAQ } from "../../components/FAQ";
import { classifierFaqList } from "../../constants/faq";
import { AboutPage } from "../../enums/classify";
import {
  FeatureShowcaseData,
} from "../../components/FeatureShowcaseSection";

import AboutHeader from "../../components/AboutHeader";
import {
  ClassifyInput,
  ClassifyInputHandle,
} from "../../components/ClassifyInput";
import ClassificationExamplesSection from "../../components/ClassificationExamplesSection";

// const CLASSIFY_SUPPORTING_BULLETS = [
//   "Results in ~1 Minute",
//   "Generates Defense Report",
//   "Share with Clients & Teammates",
// ];

const HERO_PRODUCT_ROWS = [
  [
    "Ceramic brake pads for passenger vehicles",
    "Men's cotton crew-neck t-shirt",
    "Stainless steel insulated water bottle",
    "Corrugated cardboard shipping boxes",
    "Bamboo cutting board with juice groove",
    "Hydraulic excavator bucket teeth",
  ],
  [
    "Lithium-ion battery pack for solar storage",
    "Glazed ceramic tile, 12 x 12 inches",
    "Optical fiber patch cables, single-mode",
    "Children's plastic building block set",
    "Organic freeze-dried coffee",
    "CNC machined aluminum enclosure",
  ],
  [
    "Industrial rubber conveyor belt",
    "Women's 100% cotton knit sweater",
    "LED grow lights for indoor farming",
    "Titanium dental implant abutment",
    "Polyester webbing cargo straps",
    "Bluetooth noise-cancelling headphones",
  ],
];

const featureSections: FeatureShowcaseData[] = [
  {
    title: "Candidates for Any Product",
    tagline: "AI-Powered Suggestions",
    description:
      "Jump-start classifications with AI suggestions. See HS heading suggestions for any item and discover headings you might have missed.",
    features: [
      {
        title: "Jump-Start Classifications",
        description: "Get AI suggestions for any product description",
      },
      {
        title: "Discover Missing Headings",
        description: "Find headings you might have overlooked",
      },
      {
        title: "Add Your Own",
        description: "Easily find and apply your own HS headings",
      },
      {
        title: "~10 Minutes Saved",
        description: "Per classification on average",
      },
    ],
    appUrl: "/classifications/new",
    cta: "Try It Now",
    media: {
      src: "/get-candidates.mp4",
      type: "video",
    },
  },
  {
    title: "Best-Fit Analysis",
    tagline: "GRI Analysis at Every Level",
    description:
      "Get a comprehensive GRI analysis of candidates at every level to help you quickly determine the best classification.",
    features: [
      {
        title: "GRI Analysis",
        description: "Comprehensive analysis at every classification level",
      },
      {
        title: "Best Candidate",
        description: "Quickly determine the best fit for your product",
      },
      {
        title: "Add Notes",
        description: "Easily add your own notes and reasoning",
      },
      {
        title: "~10 Minutes Saved",
        description: "Per classification on average",
      },
    ],
    appUrl: "/classifications/new",
    cta: "Analyze Now",
    media: {
      src: "/candidate-analysis.png",
      type: "image",
    },
  },
  {
    title: "Validate Against Government Rulings",
    tagline: "CROSS Rulings Integration",
    description:
      "See CROSS rulings related to your item and find out if CBP agrees with your classification.",
    features: [
      {
        title: "Related Rulings",
        description: "See CROSS rulings related to your item",
      },
      {
        title: "CBP Validation",
        description: "Find out if CBP agrees with your classification",
      },
      {
        title: "~10 Minutes Saved",
        description: "Per classification on average",
      },
    ],
    appUrl: "/classifications/new",
    cta: "Validate Now",
    media: {
      src: "/cross-rulings.mp4",
      type: "video",
    },
  },
  {
    title: "Branded Reports, In A Single Click",
    tagline: "Professional Documentation",
    description:
      "Generate polished classification reports with your branding, notes, disclaimers, and contact info automatically included.",
    features: [
      {
        title: "One-Click Reports",
        description: "Generate polished reports instantly",
      },
      {
        title: "Your Branding",
        description:
          "Automatically includes your branding, disclaimers, and contact info",
      },
      {
        title: "Easy Record Keeping",
        description: "Effortless record keeping and sharing with clients",
      },
      {
        title: "~20 Minutes Saved",
        description: "Per classification on average",
      },
    ],
    appUrl: "/classifications/new",
    cta: "Generate Report",
    media: {
      src: "/report.png",
      type: "image",
    },
  },
  {
    title: "Collaborate With Your Whole Team",
    tagline: "Team Collaboration",
    description:
      "See, review, and approve each other's classifications. Collaborate on classifications and track progress together.",
    features: [
      {
        title: "Review & Approve",
        description: "See, review, and approve each other's classifications",
      },
      {
        title: "Collaborate",
        description: "Work together on classifications and track progress",
      },
      {
        title: "Search & Filter",
        description: "Search by description, status, importer, and classifier",
      },
      {
        title: "Better Results",
        description: "Quicker classifications with fewer mistakes",
      },
    ],
    appUrl: "/classifications/new",
    cta: "Start Collaborating",
    media: {
      src: "/teams.png",
      type: "image",
    },
  },
];

function AnimatedProductExamples({
  onExampleClick,
}: {
  onExampleClick: (example: string) => void;
}) {
  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* <p className="text-center text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] mb-3 sm:mb-4">
        Try One! 👇
      </p> */}

      <div className="relative overflow-hidden px-3 pb-3 sm:px-4 sm:pb-4">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-20 bg-gradient-to-r from-base-100 via-base-100/90 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-20 bg-gradient-to-l from-base-100 via-base-100/90 to-transparent z-10" />

        <div className="group space-y-2.5 sm:space-y-3">
          {HERO_PRODUCT_ROWS.map((row, rowIndex) => {
            const repeatedRow = [...row, ...row];
            const isHiddenOnMobile = rowIndex > 0;

            return (
              <div
                key={`hero-product-row-${rowIndex}`}
                className={isHiddenOnMobile ? "hidden sm:block" : ""}
              >
                <div
                  className="hero-marquee-track flex w-max gap-2.5 sm:gap-3"
                  style={{
                    animationDuration: `${300 + rowIndex * 4}s`,
                    animationDirection: rowIndex % 2 === 0 ? "normal" : "reverse",
                  }}
                >
                  {repeatedRow.map((example, exampleIndex) => (
                    <button
                      key={`${rowIndex}-${exampleIndex}-${example}`}
                      type="button"
                      onClick={() => onExampleClick(example)}
                      className="border border-base-content/10 rounded-full bg-base-100/85 px-3 py-1.5 text-xs sm:text-sm whitespace-nowrap text-base-content/50 transition-all duration-200 hover:border-primary/25 hover:bg-base-100 hover:text-primary"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* <p className="mt-3 text-center text-xs text-base-content/45">
        Tap any example to drop it into the box above.
      </p> */}

      <style jsx>{`
        .hero-marquee-track {
          animation-name: hero-marquee;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          will-change: transform;
        }

        .group:hover .hero-marquee-track {
          animation-play-state: paused;
        }

        @keyframes hero-marquee {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}

export default function Home() {
  const classifyInputRef = useRef<ClassifyInputHandle>(null);

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
      <div className="relative overflow-hidden bg-base-100 content-center" style={{ height: "94svh" }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-secondary/10 md:bg-secondary/20 rounded-full blur-3xl" />
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/10 md:bg-primary/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center px-4 sm:px-6">
          <h1 className="text-center text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-8 md:mb-10 max-w-xs sm:max-w-5xl">
            Find Any HTS Code,{" "}
            <span className="text-secondary">
              Fast
            </span>
          </h1>

          {/* <p className="text-center text-base-content/70 text-sm sm:text-base md:text-lg mb-8 md:mb-10 max-w-xs sm:max-w-3xl">
            Avoid expensive mistakes, save time, and eliminate import risk
          </p> */}

          {/* CTA input — the focal point of the page */}
          <div className="w-full max-w-4xl mx-auto mb-4 md:mb-6">
            <ClassifyInput
              ref={classifyInputRef}
              buttonText="Find HTS Code"
              placeholder="Enter a product description"
              entryPoint="classify_landing"
            />
          </div>

          <AnimatedProductExamples
            onExampleClick={(example) =>
              classifyInputRef.current?.setDescription(example)
            }
          />

          {/* Supporting bullets — quiet reinforcement */}
          {/* <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-3 gap-y-1.5 sm:gap-x-5 justify-center my-3 sm:my-4">
            {CLASSIFY_SUPPORTING_BULLETS.map((bullet) => (
              <div
                key={bullet}
                className="text-center font-semibold flex items-center justify-center gap-1 sm:gap-1.5 text-sm text-base-content/70"
              >
                <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-success shrink-0" />
                <span>{bullet}</span>
              </div>
            ))}
          </div> */}

          {/* <p className="text-xs sm:text-sm text-center px-4 font-medium text-base-content/50">
            Trusted by Customs Brokers & Importers to Find <span className="font-extrabold">1,000+ Audit-Ready HTS Codes</span>
          </p> */}


        </div>
      </div>


      {/* Classification Examples */}
      <ClassificationExamplesSection />

      {/* How It Works */}
      {/* <HowItWorksSection /> */}

      {/* Benefits Comparison */}
      {/* <BenefitsComparisonSection /> */}


      {/* Feature Sections */}
      {/* <div id="features">
        {featureSections.map((feature, index) => (
          <FeatureShowcaseSection key={feature.title} feature={feature} index={index} />
        ))}
      </div> */}

      {/* Pricing Section */}
      <ClassifyPricing customerType={AboutPage.CLASSIFIER} />

      {/* Demo Section */}
      {/* <ProductDemoSection
        title="See How it Works"
        subtitle="A quick demo so you know exactly what you'll get"
        demoUrl="https://www.youtube.com/embed/izlXZvC-O7I?si=o6G0z0ZDhEbvIMqg"
      /> */}

      {/* FAQ Section */}
      <FAQ faqItems={classifierFaqList} />

      <ClassifierFooter />
    </div>
  );
}
