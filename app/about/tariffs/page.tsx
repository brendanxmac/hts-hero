"use client";

import { Suspense } from "react";
import ClassifierFooter from "@/components/ClassifierFooter";
import WithWithout, { Task } from "@/components/WithWithout";
import FeaturesGrid from "@/components/FeaturesGrid";
import Demo from "@/components/Demo";
import { FAQ } from "@/components/FAQ";
import { tariffImpactFaqList } from "@/constants/faq";
import CTA from "@/components/CTA";
import TariffImpactHeader from "@/components/TariffImpactHeader";
import { PendingTariffsList } from "../../../components/UpcomingTariffsList";
import TariffImpactPricing from "../../../components/TariffImpactPricing";

const withoutTariffImpact: Task[] = [
  {
    title: "Waiting for your team or broker",
    time: "⏳",
  },
  {
    title: "One code at at time",
    time: "😓",
  },
  {
    title: "Manual Mistakes",
    time: "😅",
  },
  {
    title: "Not realizing another update has happened",
    time: "🤦‍♂️",
  },
];

const withTariffImpact: Task[] = [
  {
    title: "Instant results",
    time: "⚡️",
  },
  {
    title: "All codes at once",
    time: "🎉",
  },
  {
    title: "No second guessing",
    time: "😌",
  },
  {
    title: "Notifies you when updates happen (coming soon)",
    time: "💬",
  },
];

export default function Home() {
  return (
    <>
      <Suspense>
        <TariffImpactHeader />
      </Suspense>
      <main>
        <FeaturesGrid />

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
          title="Discover Potential"
          subtitle="See the full list of tariffs for any import from any country & explore options for possible savings"
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

        {/* <WithWithout
          title="No Waiting, Guessing, or Limits"
          subtitle="Get answers in seconds for all your imports"
          ctaText="Check your Imports"
          ctaLink="/tariffs/impact-checker"
          withKeyPoint={{
            title: "Clarity",
            detail: "No more guessing or waiting",
          }}
          withoutKeyPoint={{
            title: "Confusion & Delay",
            detail: "Manual, error-prone, time-consuming",
          }}
          withList={withTariffImpact}
          withoutList={withoutTariffImpact}
        /> */}
        {/* <CTA
          title="Get Clarity in the Chaos"
          subtitle="Find out if you're affected by new tariffs now!"
          ctaText="Check your Imports"
          ctaLink="/tariffs/impact-checker"
        /> */}
        <FAQ faqItems={tariffImpactFaqList} />

        <PendingTariffsList />
      </main>
      <ClassifierFooter />
    </>
  );
}
