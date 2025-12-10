"use client";

import { Suspense } from "react";
import AboutHeader from "../../components/AboutHeader";
import ClassifierFooter from "../../components/ClassifierFooter";
import ClassifyPricing from "../../components/ClassifyPricing";
import { FAQ } from "../../components/FAQ";
import { classifierFaqList } from "../../constants/faq";
import { AboutPage } from "../../enums/classify";
import FeaturesListicle from "../../components/FeaturesListicle";
import TrustedBy from "../../components/TrustedBy";
import ClassifierHero from "../../components/ClassifierHero";
import ProductDemoSection from "../../components/ProductDemoSection";

// const withoutClassify: Task[] = [
//   {
//     title: "Finding Headings",
//     time: "15 min",
//   },
//   {
//     title: "Fetching Notes & Rulings",
//     time: "10 min",
//   },
//   {
//     title: "Finding Tariffs & Exemptions",
//     time: "10 min",
//   },
//   {
//     title: "Creating Advisory Reports",
//     time: "15 min",
//   },
//   {
//     title: "Saving, Sharing, Finding, and Updating Classifications",
//     time: "?? min",
//   },
// ];

// const withClassify: Task[] = [
//   {
//     title: "Finding Headings",
//     time: "0 min",
//     notTime: "15 min",
//   },
//   {
//     title: "Fetching Notes & Rulings",
//     time: "0 min",
//     notTime: "10 min",
//   },
//   {
//     title: "Finding Tariffs & Exemptions",
//     time: "0 min",
//     notTime: "10 min",
//   },
//   {
//     title: "Creating Advisory Reports",
//     time: "0 min",
//     notTime: "15 min",
//   },
//   {
//     title: "Saving, Sharing, Finding, and Updating Classifications",
//     time: "0 min",
//     notTime: "?? min",
//   },
// ];

export default function Home() {
  return (
    <>
      <Suspense>
        <AboutHeader />
      </Suspense>
      <main>
        <ClassifierHero />
        <TrustedBy />
        <FeaturesListicle />
        <ClassifyPricing customerType={AboutPage.CLASSIFIER} />
        <ProductDemoSection
          title="See How it Works"
          subtitle="A quick demo so you know exactly what you'll get"
          demoUrl="https://www.youtube.com/embed/izlXZvC-O7I?si=o6G0z0ZDhEbvIMqg"
        />
        {/* <ClassifierCTA /> */}
        <FAQ faqItems={classifierFaqList} />
      </main>
      <ClassifierFooter />
    </>
  );
}
