"use client";

import { Suspense } from "react";
import ClassifierFooter from "@/components/ClassifierFooter";
import TariffAboutHeader from "@/components/TariffAboutHeader";
import { PendingTariffsList } from "../../../components/UpcomingTariffsList";
import TariffImpactPricing from "../../../components/TariffImpactPricing";
import TrustedBy from "../../../components/TrustedBy";
import TariffFeaturesGrid from "../../../components/TariffHero";
import TariffFeaturesListicle from "../../../components/TariffFeaturesListicle";
import ProductDemoSection from "../../../components/ProductDemoSection";

export default function Home() {
  return (
    <>
      <Suspense>
        <TariffAboutHeader />
      </Suspense>
      <main>
        <TariffFeaturesGrid />
        <TrustedBy />
        <TariffFeaturesListicle />
        <TariffImpactPricing />
        <ProductDemoSection
          title="See How it Works"
          subtitle="A quick demo so you know exactly what you'll get"
          demoUrl="https://www.youtube.com/embed/KZ6zv9ujarY?si=aEgVcGIC-gLfSMG4"
        />

        <PendingTariffsList />
      </main>
      <ClassifierFooter />
    </>
  );
}
