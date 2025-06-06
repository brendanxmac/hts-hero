"use client";
import { Suspense, useState } from "react";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import FeaturesAccordion from "@/components/FeaturesAccordion";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import AboutHeader from "../classifiers/AboutHeader";
import Pricing from "@/components/Pricing";
import ItsFree from "../../components/ItsFree";

export default function Home() {
  const [showItsFree, setShowItsFree] = useState(false);
  return (
    <>
      <Suspense>
        <AboutHeader page="importers" />
      </Suspense>
      <main>
        <ItsFree isOpen={showItsFree} onClose={() => setShowItsFree(false)} />
        <Hero />
        <Problem />
        <FeaturesAccordion />
        <Pricing customerType="importer" setShowItsFree={setShowItsFree} />
        <CTA />
        {/* <FAQ /> */}
      </main>
      <Footer />
    </>
  );
}
