"use client";

import { Suspense } from "react";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
// import FeaturesAccordion from "@/components/FeaturesAccordion";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import Pricing from "@/components/Pricing";
import AboutHeader from "../../../components/AboutHeader";
import { FAQ } from "../../../components/FAQ";
import { importerFaqList } from "../../../constants/faq";
import { AboutPage } from "../../../enums/classify";

export default function Home() {
  return (
    <>
      <Suspense>
        <AboutHeader />
      </Suspense>
      <main>
        <Hero />
        <Problem />
        {/* <FeaturesAccordion features={importerFeatures} /> */}
        <Pricing customerType={AboutPage.IMPORTER} />
        <CTA />
        <FAQ faqItems={importerFaqList} />
      </main>
      <Footer />
    </>
  );
}
