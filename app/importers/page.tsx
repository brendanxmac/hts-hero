"use client";
import { Suspense } from "react";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import FeaturesAccordion from "@/components/FeaturesAccordion";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import AboutHeader from "../classifiers/AboutHeader";

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
        {/* <Pricing /> */}
        <CTA />
        {/* <FAQ /> */}
      </main>
      <Footer />
    </>
  );
}
