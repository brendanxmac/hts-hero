"use client";

import { Suspense, useEffect, useState } from "react";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import FeaturesAccordion from "@/components/FeaturesAccordion";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import Pricing from "@/components/Pricing";
import ItsFree from "../../../components/ItsFree";
import { BuyAttempt } from "../../api/buy-attempt/route";
import ClassifierHeader from "../../../components/ClassifierHeader";
import { FAQ } from "../../../components/FAQ";
import { importerFaqList } from "../../../constants/faq";
import { CustomerType } from "../../../enums/classify";

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
        <ClassifierHeader page={CustomerType.IMPORTER} />
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
          customerType={CustomerType.IMPORTER}
          setBuyAttempt={setBuyAttempt}
          setShowItsFree={setShowItsFree}
        />
        <CTA />
        <FAQ faqItems={importerFaqList} />
      </main>
      <Footer />
    </>
  );
}
