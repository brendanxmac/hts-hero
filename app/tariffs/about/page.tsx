"use client";

import { Suspense } from "react";
import AboutHeader from "@/components/AboutHeader";
import ClassifierFooter from "@/components/ClassifierFooter";
import { FAQ } from "@/components/FAQ";
import { classifierFaqList } from "@/constants/faq";
import WithWithout, { Task } from "@/components/WithWithout";
import TariffImpactHero from "../../../components/TariffImpactHero";

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
        <TariffImpactHero />
        <WithWithout
          title="Automate Your Tariff Impact Checks"
          // subtitle="So you can quickly take bottom-line saving action when updates happen"
          subtitle="No more delay, headaches, and error-prone manual labor"
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
        {/* <Pricing customerType={AboutPage.CLASSIFIER} /> */}
        <FAQ faqItems={classifierFaqList} />
      </main>
      <ClassifierFooter />
    </>
  );
}
