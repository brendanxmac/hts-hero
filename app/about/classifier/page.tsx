"use client";

import { Suspense } from "react";
import AboutHeader from "../../../components/AboutHeader";
import ClassifierHero from "../../../components/ClassifierHero";
import ClassifierCTA from "../../../components/ClassifierCTA";
import ClassifierFooter from "../../../components/ClassifierFooter";
import Pricing from "../../../components/Pricing";
import WithWithout from "../../../components/WithWithout";
import FeaturesListicle from "../../../components/FeaturesListicle";
import { FAQ } from "../../../components/FAQ";
import { classifierFaqList } from "../../../constants/faq";
import { AboutPage } from "../../../enums/classify";

export default function Home() {
  return (
    <>
      <Suspense>
        <AboutHeader />
      </Suspense>
      <main>
        <ClassifierHero />
        <WithWithout />
        <FeaturesListicle />
        <Pricing customerType={AboutPage.CLASSIFIER} />
        <ClassifierCTA />
        <FAQ faqItems={classifierFaqList} />
      </main>
      <ClassifierFooter />
    </>
  );
}
