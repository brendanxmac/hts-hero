"use client";

import { Suspense, useEffect, useState } from "react";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import FeaturesAccordion from "@/components/FeaturesAccordion";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import Pricing from "@/components/Pricing";
import { BuyAttempt } from "../api/buy-attempt/route";
import ItsFree from "../../components/ItsFree";
import AboutHeader from "../../components/AboutHeader";

export default function Home() {
  const [buyAttempt, setBuyAttempt] = useState<BuyAttempt | null>(null);
  const [showItsFree, setShowItsFree] = useState(false);

  useEffect(() => {
    if (!window.name) {
      window.name = crypto.randomUUID(); // Generate a unique ID to set a 'session' for the user
    }
  }, []);

  return (
    <>
      <Suspense>
        <AboutHeader page="importers" />
      </Suspense>
      <main>
        <ItsFree
          buyAttempt={buyAttempt}
          isOpen={showItsFree}
          onClose={() => setShowItsFree(false)}
        />
        <Hero />
        <Problem />
        <FeaturesAccordion />
        <Pricing
          customerType="importer"
          setBuyAttempt={setBuyAttempt}
          setShowItsFree={setShowItsFree}
        />
        <CTA />
        {/* <FAQ /> */}
      </main>
      <Footer />
    </>
  );
}
