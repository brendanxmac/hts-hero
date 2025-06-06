"use client";
import { Suspense } from "react";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import FeaturesAccordion from "@/components/FeaturesAccordion";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import AboutHeader from "../classifiers/AboutHeader";
import Pricing from "@/components/Pricing";

export default function Home() {
  return (
    <>
      <Suspense>
        <AboutHeader page="importers" />
      </Suspense>
      <main>
        <Hero />
        <Problem />
        <FeaturesAccordion />
        <Pricing customerType="importer" />
        <CTA />
        {/* <FAQ /> */}
      </main>
      <Footer />
    </>
  );
}
