"use client";

import { Suspense } from "react";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import FeaturesAccordion from "@/components/FeaturesAccordion";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import Pricing from "@/components/Pricing";
import AboutHeader from "../../../components/AboutHeader";
import { FAQ } from "../../../components/FAQ";
import { importerFaqList } from "../../../constants/faq";
import { AboutPage } from "../../../enums/classify";

export default function Home() {
  // const [buyAttempt, setBuyAttempt] = useState<BuyAttempt | null>(null);
  // const [showItsFree, setShowItsFree] = useState(false);

  // useEffect(() => {
  //   if (!window.name) {
  //     window.name = crypto.randomUUID(); // Generate a unique ID to set a 'session' for the user
  //   }
  // }, []);

  return (
    <>
      <Suspense>
        <AboutHeader page={AboutPage.IMPORTER} />
      </Suspense>
      <main>
        <Hero />
        <Problem />
        <FeaturesAccordion />
        <Pricing customerType={AboutPage.IMPORTER} />
        <CTA />
        <FAQ faqItems={importerFaqList} />
      </main>
      <Footer />
    </>
  );
}
