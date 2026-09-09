"use client";

import { Suspense, useState } from "react";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import LetsTalkModal from "../components/LetsTalkModal";
import { useUser } from "../contexts/UserContext";
import { AboutPage } from "../enums/classify";
import { MixpanelEvent, trackEvent } from "../libs/mixpanel";
import LandingHeader from "../components/LandingHeader";
import TestimonialsStrip from "../components/TestimonialsStrip";
import { FAQ } from "../components/FAQ";
import { bundleFaqList } from "../constants/faq";
import Footer from "../components/Footer";
import UseCases from "../components/UseCases";
import ClassifyPricing from "./ClassifyPricing";
import ClassificationExamplesSection from "./ClassificationExamplesSection";
import { HeroClassifyInput } from "./HeroClassifyInput";
import HowItWorksSection from "./HowItWorksSection";

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

export function HomePage() {
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
      {/* <CTABanner
        message={`Produce HTS classifications that avoid audits, in minutes`}
        ctaText="Book Demo"
        onClick={handleBookDemoClick}
      /> */}
      <div className="flex min-h-dvh flex-col">
        <Suspense
          fallback={
            <div className="h-16 bg-base-100 border-b border-base-content/20" />
          }
        >
          <LandingHeader />
        </Suspense>

        {/* Hero Section with Integrated Social Proof */}
        <div className="relative flex flex-1 flex-col overflow-hidden bg-base-100">
          {/* Background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-32 -left-24 w-80 h-80 bg-primary/10 md:bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute -top-32 -right-24 w-80 h-80 bg-secondary/10 md:bg-secondary/20 rounded-full blur-3xl" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-gradient-radial from-primary/5 to-transparent rounded-full blur-3xl" />
            {/* Subtle grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.025]"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                backgroundSize: "32px 32px",
              }}
            />
          </div>

          <div id="try-classify" className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 sm:px-6 py-8 md:py-12">
            {/* Main Hero Content */}
            <div className="text-center max-w-4xl w-full">
              {/* Credibility eyebrow */}
              {/* <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-base-200/70 border border-base-content/10 text-xs sm:text-sm font-medium text-base-content/70 mb-6 backdrop-blur">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                Built for Customs Brokers &amp; US Importers
              </div> */}

              <div className="flex items-center justify-center gap-1.5 sm:gap-3 mb-8 text-sm md:text-base">
                <span className="text-amber-400">
                  ★
                </span>
                <p className="font-medium">
                  Trusted by <strong className="text-primary md:text-lg">300+</strong> Customs Brokers & Importers
                </p>
                <span className="text-amber-400">
                  ★
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.05] mb-5">
                Produce Audit-Ready Classifications in {" "}
                <span className="relative whitespace-nowrap text-primary">
                  Minutes
                  <span className="absolute -bottom-0 left-0 w-full h-[6px] bg-primary/20 rounded-full -z-10" />
                </span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-base-content/70 max-w-2xl mx-auto leading-relaxed mb-8 mt-6">
                Quickly find candidates, eliminate blind spots, and back every
                code with legal notes and CROSS rulings.
              </p>

              <div
                className="w-full max-w-6xl mx-auto pt-4 md:pt-8 scroll-mt-24"
              >
                <HeroClassifyInput />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 pt-4 md:pt-8 bg-base-100">
        <TestimonialsStrip showCompanies={false} />
        <section className="relative overflow-hidden bg-base-100 px-4 sm:px-6 pt-4 pb-6 md:pb-8 mt-6">
          <div className="w-full max-w-4xl mx-auto">
            <div className="text-center mb-6 md:mb-8">
              {/* <p className="text-sm md:text-base font-semibold uppercase tracking-[0.18em] text-base-content/45 mb-2">
                See What You&apos;re Missing
              </p> */}
              <div className="flex justify-center mb-2">
                <svg
                  className="h-8 w-8 md:h-10 md:w-10 text-primary animate-bounce"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 13l-7 7-7-7m7 7V4"
                  />
                </svg>
              </div>

            </div>
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
        </section>
      </div>

      <HowItWorksSection />


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

      <div className="mt-8 md:mt-12">
        <ClassificationExamplesSection />
      </div>


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

          {/* <div className="flex flex-col items-center justify-center gap-4 mt-10">
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
          </div> */}
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
