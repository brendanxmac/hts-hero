"use client";
import { Suspense } from "react";
import UnauthenticatedHeader from "@/components/UnauthenticatedHeader";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
// import FeaturesAccordion from "@/components/FeaturesAccordion";
// import Pricing from "@/components/Pricing";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Suspense>
        <UnauthenticatedHeader />
      </Suspense>
      <main>
        <Hero />
        <Problem />
        {/* <FeaturesAccordion /> */}
        {/* <Pricing /> */}
        <CTA />
        {/* <FAQ /> */}
      </main>
      <Footer />
    </>
  );
}
