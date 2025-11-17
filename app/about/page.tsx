"use client";

import { Suspense } from "react";
import AboutHeader from "../../components/AboutHeader";
import ClassifierCTA from "../../components/ClassifierCTA";
import ClassifierFooter from "../../components/ClassifierFooter";
import Pricing from "../../components/Pricing";
import { FAQ } from "../../components/FAQ";
import { classifierFaqList } from "../../constants/faq";
import { AboutPage } from "../../enums/classify";
import FeaturesListicle from "../../components/FeaturesListicle";
import TrustedBy from "../../components/TrustedBy";
import ClassifierHero from "../../components/ClassifierHero";

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

        {/* <WithWithout
          subject="Classification"
          title="Classification Doesn't Have to Be Painful"
          // withoutKeyPoint={{
          //   title: "~1 Hour",
          //   detail: "Manual, time-consuming process",
          // }}
          withKeyPoint={{
            title: "Automated",
            detail: "Steamlined, efficient workflow",
          }}
          withList={withClassify}
          // withoutList={withoutClassify}
        /> */}

        <section className="relative w-full bg-base-300 px-4 sm:px-6 py-12 sm:py-20">
          <div className="flex flex-col max-w-5xl mx-auto items-center text-center gap-3 sm:gap-4 mb-8">
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/80">
              Real product demo
            </span>
            <h2 className="font-black text-white text-3xl sm:text-5xl md:text-6xl">
              See How it Works
            </h2>
            <p className="text-white/80 sm:text-lg lg:text-xl">
              A quick demo so you know exactly what you&apos;ll get
            </p>
          </div>
          <div className="relative max-w-3xl mx-auto">
            <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-tr from-indigo-500/20 via-cyan-500/10 to-transparent blur"></div>
            <div className="relative rounded-2xl border border-white/10 bg-black/30 shadow-xl">
              <iframe
                className="w-full aspect-video rounded-lg"
                src="https://www.youtube.com/embed/izlXZvC-O7I?si=o6G0z0ZDhEbvIMqg"
                title="Classify Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </section>

        <Pricing customerType={AboutPage.CLASSIFIER} />
        <FAQ faqItems={classifierFaqList} />
        <ClassifierCTA />
      </main>
      <ClassifierFooter />
    </>
  );
}
