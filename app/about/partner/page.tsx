"use client";

import { Suspense } from "react";
import AboutHeader from "../../../components/AboutHeader";
import { FAQ } from "../../../components/FAQ";
import { classifierFaqList } from "../../../constants/faq";
// import { AboutPage } from "../../../enums/classify";
import PartnerCTA from "../../../components/partner/PartnerCTA";
import PartnerHero from "../../../components/partner/PartnerHero";
import PartnerFeaturesListicle from "../../../components/partner/PartnerFeaturesListicle";
import PartnerProblem from "../../../components/partner/PartnerProblem";
import PartnerFooter from "../../../components/partner/PartnerFooter";

export default function Home() {
  return (
    <>
      <Suspense>
        <AboutHeader />
      </Suspense>
      <main>
        <PartnerHero />
        <PartnerProblem />
        <PartnerFeaturesListicle />
        {/* <Pricing customerType={AboutPage.PARTNER} /> */}
        <PartnerCTA />
        <FAQ faqItems={classifierFaqList} />
      </main>
      <PartnerFooter />
    </>
  );
}
