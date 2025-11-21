"use client";

import { Suspense } from "react";
import ClassifierFooter from "@/components/ClassifierFooter";
import WithWithout, { Task } from "@/components/WithWithout";
import TariffImpactFeaturesGrid from "@/components/TariffImpactFeaturesGrid";
import Demo from "@/components/Demo";
import { FAQ } from "@/components/FAQ";
import { tariffImpactFaqList } from "@/constants/faq";
import TariffAboutHeader from "@/components/TariffAboutHeader";
import { PendingTariffsList } from "../../../components/UpcomingTariffsList";
import TariffImpactPricing from "../../../components/TariffImpactPricing";
import TrustedBy from "../../../components/TrustedBy";

const withoutTariffImpact: Task[] = [
  {
    title: "Tracking & Understanding Changes",
    time: "1 hour / change",
  },
  {
    title: "Finding Out What's Affected",
    time: "30 min / change",
  },
  {
    title: "Checking Imports",
    time: "~20 min / catalog",
  },
  {
    title: "Finding Latest Tariffs & Exemptions",
    time: "20 min / import",
  },
  {
    title: "Applying Current Tariff Stacking Rules",
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
        <TariffAboutHeader />
      </Suspense>
      <main>
        <TariffImpactFeaturesGrid />

        <TrustedBy showTestimonials={false} />
        <div className="h-10 bg-base-300"></div>

        <Demo
          standoutPlacement="end"
          titleStandout=""
          title="See If Your Imports Are Affected By New Tariffs"
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

        <div className="hidden md:block">
          <Demo
            standoutPlacement="start"
            titleStandout=""
            title="Get Notified When Tariffs Affect Your Imports"
            subtitle="Receive email notifications when new tariff announcements affect your imports"
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
            titleStandout=""
            title="Get Notified When Tariffs Affect Your Imports"
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
          titleStandout=""
          title="Discover Tariff Savings"
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

        <WithWithout
          subject="Tariffs"
          title="Keeping up with Tariff Changes is a Nightmare"
          withoutKeyPoint={{
            title: "Error-Prone & Time-Consuming",
          }}
          withoutList={withoutTariffImpact}
        />

        <TariffImpactPricing />

        <FAQ faqItems={tariffImpactFaqList} />

        <PendingTariffsList />
      </main>
      <ClassifierFooter />
    </>
  );
}
