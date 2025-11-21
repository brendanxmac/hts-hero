"use client";

import { Suspense } from "react";
import ClassifierFooter from "@/components/ClassifierFooter";
import WithWithout, { Task } from "@/components/WithWithout";
import TariffAboutHeader from "@/components/TariffAboutHeader";
import { PendingTariffsList } from "../../../components/UpcomingTariffsList";
import TariffImpactPricing from "../../../components/TariffImpactPricing";
import TrustedBy from "../../../components/TrustedBy";
import TariffFeaturesGrid from "../../../components/TariffHero";
import TariffFeaturesListicle from "../../../components/TariffFeaturesListicle";

const withoutTariffImpact: Task[] = [
  {
    title: "Tracking & Understanding Changes",
    time: "📚",
  },
  {
    title: "Finding Out What's Affected",
    time: "🔎",
  },
  {
    title: "Checking Imports",
    time: "😵‍💫",
  },
  {
    title: "Finding Latest Tariffs & Exemptions",
    time: "🙃",
  },
  {
    title: "Applying Current Tariff Stacking Rules",
    time: "😫",
  },
];

// const withTariffImpact: Task[] = [
//   {
//     title: "Get Notified When New Tariffs Affect your Imports",
//     time: "0 min",
//   },
//   {
//     title: "Instantly see which imports are affected",
//     time: "0 min",
//   },
//   {
//     title: "Save lists of codes for future checks",
//     time: "0 min",
//   },
//   {
//     title: "Find all Tariffs & Exemptions",
//     time: "0 min",
//   },
//   {
//     title: "Applies Stacking Rules Automatically",
//     time: "0 min",
//   },
//   {
//     title: "Finds Rates for Every Country",
//     time: "0 min",
//   },
// ];

export default function Home() {
  return (
    <>
      <Suspense>
        <TariffAboutHeader />
      </Suspense>
      <main>
        <TariffFeaturesGrid />

        <div className="h-8 bg-base-300"></div>
        <TrustedBy showTestimonials={false} />
        <div className="h-10 bg-base-300"></div>

        <TariffFeaturesListicle />

        <WithWithout
          subject="Tariffs"
          title="Keeping up with Tariff Changes is a Nightmare"
          withoutKeyPoint={{
            title: "Error-Prone & Time-Consuming",
          }}
          withoutList={withoutTariffImpact}
        />

        <section className="relative w-full bg-base-100 px-4 sm:px-6 py-12 sm:py-20">
          <div className="flex flex-col max-w-5xl mx-auto items-center text-center gap-3 sm:gap-4 mb-8">
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/80">
              Real product demo
            </span>
            <h2 className="font-black text-white text-3xl sm:text-5xl md:text-6xl">
              See How it Works
            </h2>
            <p className="text-white/80 sm:text-lg lg:text-xl">
              A quick demo so you know exactly what you&apos;ll get
            </p>
          </div>
          <div className="relative max-w-3xl mx-auto">
            <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-tr from-indigo-500/20 via-cyan-500/10 to-transparent blur"></div>
            <div className="relative rounded-2xl border border-white/10 bg-black/30 shadow-xl">
              <iframe
                className="w-full aspect-video rounded-lg"
                src="https://www.youtube.com/embed/KZ6zv9ujarY?si=aEgVcGIC-gLfSMG4"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </section>

        <TariffImpactPricing />

        {/* <FAQ faqItems={tariffImpactFaqList} /> */}

        <PendingTariffsList />
      </main>
      <ClassifierFooter />
    </>
  );
}
