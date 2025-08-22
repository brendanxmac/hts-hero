"use client";

import { Suspense } from "react";
import AboutHeader from "@/components/AboutHeader";
import ClassifierFooter from "@/components/ClassifierFooter";
import { FAQ } from "@/components/FAQ";
import { classifierFaqList } from "@/constants/faq";
import WithWithout, { Task } from "@/components/WithWithout";
import Hero from "../../../components/Hero";
import FeaturesGrid from "../../../components/FeaturesGrid";
import Demo from "../../../components/Demo";
import CTA from "../../../components/CTA";

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
    title: "Worrying that you missed something",
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
        <AboutHeader />
      </Suspense>
      <main>
        <FeaturesGrid />
        <WithWithout
          title="Copy, Paste, Clarity 😌"
          subtitle="Lets you quickly take bottom-line saving action when updates happen"
          // subtitle="No more delay, headaches, and error-prone manual labor"
          withKeyPoint={{
            title: "Instant Clarity",
            detail: "No more guessing or waiting",
          }}
          withoutKeyPoint={{
            title: "Confusion & Delay",
            detail: "Manual, error-prone, time-consuming",
          }}
          withList={withTariffImpact}
          withoutList={withoutTariffImpact}
        />
        <Demo
          standoutPlacement="end"
          titleStandout="before it's too late"
          title="See if you're impacted"
          subtitle="So you can save your time, worry, and bottom line"
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
        {/* <Pricing customerType={AboutPage.CLASSIFIER} /> */}
        {/* <CTA /> */}
        {/* <FAQ faqItems={classifierFaqList} /> */}
      </main>
      <ClassifierFooter />
    </>
  );
}
