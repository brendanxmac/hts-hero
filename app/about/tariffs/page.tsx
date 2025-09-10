"use client";

import { Suspense } from "react";
import ClassifierFooter from "@/components/ClassifierFooter";
import WithWithout, { Task } from "@/components/WithWithout";
import FeaturesGrid from "@/components/FeaturesGrid";
import Demo from "@/components/Demo";
import { FAQ } from "@/components/FAQ";
import { tariffImpactFaqList } from "@/constants/faq";
import TariffImpactHeader from "@/components/TariffImpactHeader";
import { PendingTariffsList } from "../../../components/UpcomingTariffsList";
import TariffImpactPricing from "../../../components/TariffImpactPricing";

const withoutTariffImpact: Task[] = [
  {
    title: "Finding & Understanding the Changes",
    time: "1 hour / change",
  },
  {
    title: "Getting a list of exactly what's affected",
    time: "30 min / change",
  },
  {
    title: "Checking client imports against what's affected",
    time: "~20 min / client",
  },
  {
    title: "Finding the latest applicable tariffs & possible exemptions",
    time: "20 min / import",
  },
  {
    title: "Finding & applying the latest tariff stacking rules",
    time: "10 min / import",
  },
  {
    title: "Getting final rates for coutry of origin",
    time: "10 min / import",
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
        <TariffImpactHeader />
      </Suspense>
      <main>
        <FeaturesGrid />

        <WithWithout
          title="Keeping up with Tariff Changes is a Nightmare"
          // subtitle="Automatically stay up to date with new tariffs and find ways to reduce your landed costs"
          // ctaText="Check your Imports"
          // ctaLink="/tariffs/impact-checker"
          // withKeyPoint={{
          //   title: "Clarity",
          //   detail: "No more guessing or waiting",
          // }}
          withoutKeyPoint={{
            title: "Error-Prone & Time-Consuming",
            // detail: "Manual, error-prone, time-consuming",
          }}
          // withList={withTariffImpact}
          withoutList={withoutTariffImpact}
        />

        <div className="hidden md:block">
          <Demo
            standoutPlacement="start"
            titleStandout="Get Notified"
            title="When Tariff Changes Affect your Imports"
            subtitle="Recieve email notifications when new tariff announcements affect your imports"
            ctaText="Try it Now!"
            ctaLink="/tariffs/impact-checker"
            media={{
              title: "Tariff Impact Notification",
              description: "Tariff Impact Notification",
              mediaType: "image",
              mediaPath: "/tariff-impact-notification-desktop.svg",
              mediaFormat: "svg",
              altText: "Tariff Impact Notification",
            }}
          />
        </div>
        <div className="md:hidden">
          <Demo
            standoutPlacement="start"
            titleStandout="Get Notified"
            title="When Updates Happen"
            subtitle="Get notified, see the impacts, and take action to save your bottom-line"
            ctaText="Try it Now!"
            ctaLink="/tariffs/impact-checker"
            media={{
              title: "Tariff Impact Notification",
              description: "Tariff Impact Notification",
              mediaType: "image",
              mediaPath: "/tariff-impact-notification-mobile.svg",
              mediaFormat: "svg",
              altText: "Tariff Impact Notification",
            }}
          />
        </div>

        <Demo
          standoutPlacement="end"
          titleStandout="Are Affected"
          title="See Which Imports"
          subtitle="Instantly know which imports are affected by tariff updates"
          ctaText="Try it Now!"
          ctaLink="/tariffs/impact-checker"
          media={{
            title: "Tariff Impacts",
            description: "Tariff Impacts Demo",
            mediaType: "video",
            mediaPath: "/tariff-impact-demo.mp4",
            mediaFormat: "mp4",
            altText: "Tariff Impacts",
          }}
        />

        <Demo
          standoutPlacement="end"
          titleStandout="Savings"
          title="See The Current Tariff Rates & Discover Potential"
          subtitle="See the full list of tariffs for any import from any country & explore ways to save"
          ctaText="Try it Now!"
          ctaLink="/tariffs/impact-checker"
          media={{
            title: "Tariff Impacts",
            description: "Tariff Impacts Demo",
            mediaType: "video",
            mediaPath: "/impacts-and-options.mp4",
            mediaFormat: "mp4",
            altText: "Tariff Impacts",
          }}
        />

        <TariffImpactPricing />

        <FAQ faqItems={tariffImpactFaqList} />

        <PendingTariffsList />
      </main>
      <ClassifierFooter />
    </>
  );
}
