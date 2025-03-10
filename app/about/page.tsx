"use client";
import { Suspense } from "react";
import AboutHeader from "./AboutHeader";
import AboutHero from "./AboutHero";
import AboutProblem from "./AboutProblem";
import AboutFeaturesAccordion from "./AboutFeaturesAccordion";
import AboutFAQ from "./AboutFAQ";
import AboutCTA from "./AboutCTA";
import AboutFooter from "./AboutFooter";
import WithWithout from "../../components/WithWithout";
import Tabs from "../../components/Tabs";
import FeaturesListicle from "../../components/FeaturesListicle";
import FeaturesGrid from "../../components/FeaturesGrid";
import { Features } from "../../components/Features";
import Pricing from "../../components/Pricing";

export default function Home() {
  return (
    <>
      <Suspense>
        <AboutHeader />
      </Suspense>
      <main>
        <AboutHero />
        <AboutProblem />
        {/* <WithWithout /> */}
        <FeaturesListicle />
        <Pricing />
        <AboutCTA />
        <AboutFAQ />
      </main>
      <AboutFooter />
    </>
  );
}
