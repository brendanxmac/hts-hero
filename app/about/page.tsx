"use client";

import { Suspense } from "react";
import AboutHeader from "../../components/AboutHeader";
import ClassifierCTA from "../../components/ClassifierCTA";
import ClassifierFooter from "../../components/ClassifierFooter";
import Pricing from "../../components/Pricing";
import { FAQ } from "../../components/FAQ";
import { classifierFaqList } from "../../constants/faq";
import { AboutPage } from "../../enums/classify";
import FeaturesListicle from "../../components/FeaturesListicle";
import WithWithout, { Task } from "../../components/WithWithout";
import Hero from "../../components/Hero";

const withoutClassify: Task[] = [
  {
    title: "Finding Headings",
    time: "15 min",
  },
  {
    title: "Fetching Notes & Rulings",
    time: "10 min",
  },
  {
    title: "Calculating Duty & Finding Exemptions",
    time: "10 min",
  },
  {
    title: "Creating Reports",
    time: "15 min",
  },
  {
    title: "Saving, Sharing, Finding, and Updating",
    time: "?? min",
  },
];

const withClassify: Task[] = [
  {
    title: "Finding Headings",
    time: "0 min",
  },
  {
    title: "Fetching Notes & Rulings",
    time: "0 min",
  },
  {
    title: "Calculating Duty & Finding Exemptions",
    time: "0 min",
  },
  {
    title: "Creating Reports",
    time: "0 min",
  },
  {
    title: "Saving, Sharing, Finding, and Updating",
    time: "0 min",
  },
];

export default function Home() {
  return (
    <>
      <Suspense>
        <AboutHeader />
      </Suspense>
      <main>
        {/* <ClassifierHero /> */}
        <Hero
          title="Classify Anything in"
          titleStandout="Minutes"
          standoutPlacement="end"
          subtitle="The classification assistant designed to make customs brokers unreasonably productive"
          ctaText="Try it Now!"
          ctaLink="/app"
          media={{
            title: "Classify Demo",
            description: "Classify Demo",
            mediaType: "video",
            mediaPath: "/hero-demo.mp4",
            mediaFormat: "mp4",
            altText: "Classify Anything",
          }}
        />
        <WithWithout
          title="Automate the Boring Bits"
          withoutKeyPoint={{
            title: "~1 Hour",
            detail: "Manual, time-consuming process",
          }}
          withKeyPoint={{
            title: "Automated",
            detail: "Steamlined, efficient workflow",
          }}
          withList={withClassify}
          withoutList={withoutClassify}
        />
        <FeaturesListicle />
        <Pricing customerType={AboutPage.CLASSIFIER} />
        <ClassifierCTA />
        <FAQ faqItems={classifierFaqList} />
      </main>
      <ClassifierFooter />
    </>
  );
}
