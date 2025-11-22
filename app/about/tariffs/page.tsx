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
import ProductDemoSection from "../../../components/ProductDemoSection";

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
        {/* <WithWithout
          subject="Tariffs"
          title="Keeping up with Tariff Changes is a Nightmare"
          withoutKeyPoint={{
            title: "Error-Prone & Time-Consuming",
          }}
          withoutList={withoutTariffImpact}
        /> */}
        <TariffImpactPricing />
        <ProductDemoSection
          title="See How it Works"
          subtitle="A quick demo so you know exactly what you'll get"
          demoUrl="https://www.youtube.com/embed/KZ6zv9ujarY?si=aEgVcGIC-gLfSMG4"
        />

        <PendingTariffsList />
      </main>
      <ClassifierFooter />
    </>
  );
}
