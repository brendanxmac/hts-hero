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
import { UpcomingTariffsList } from "../../../components/UpcomingTariffsList";

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
        <UpcomingTariffsList />
        <Demo
          standoutPlacement="end"
          titleStandout=""
          title="Copy, Paste, Clarity ✅"
          subtitle="Grab your codes and paste them in for instant answers"
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
        <WithWithout
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
        />
        <CTA
          title="Get Clarity in the Chaos"
          subtitle="Find out if you're affected by new tariffs now!"
          ctaText="Check your Imports"
          ctaLink="/tariffs/impact-checker"
        />
        <FAQ faqItems={tariffImpactFaqList} />
      </main>
      <ClassifierFooter />
    </>
  );
}
