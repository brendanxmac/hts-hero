"use client";

import { Suspense } from "react";
import ClassifierFooter from "@/components/ClassifierFooter";
import WithWithout, { Task } from "@/components/WithWithout";
import TariffImpactHeader from "@/components/TariffImpactHeader";
import { PendingTariffsList } from "../../../components/UpcomingTariffsList";
import TariffImpactPricing from "../../../components/TariffImpactPricing";
import TrustedBy from "../../../components/TrustedBy";
import TariffFeaturesGrid from "../../../components/TariffHero";
import TariffFeaturesListicle from "../../../components/TariffFeaturesListicle";

const withoutTariffImpact: Task[] = [
  {
    title: "Tracking & Understanding Changes",
    time: "📚",
  },
  {
    title: "Finding Out What's Affected",
    time: "🔎",
  },
  {
    title: "Checking Imports",
    time: "😵‍💫",
  },
  {
    title: "Finding Latest Tariffs & Exemptions",
    time: "🙃",
  },
  {
    title: "Applying Current Tariff Stacking Rules",
    time: "😫",
  },
];

// const withTariffImpact: Task[] = [
//   {
//     title: "Get Notified When New Tariffs Affect your Imports",
//     time: "0 min",
//   },
//   {
//     title: "Instantly see which imports are affected",
//     time: "0 min",
//   },
//   {
//     title: "Save lists of codes for future checks",
//     time: "0 min",
//   },
//   {
//     title: "Find all Tariffs & Exemptions",
//     time: "0 min",
//   },
//   {
//     title: "Applies Stacking Rules Automatically",
//     time: "0 min",
//   },
//   {
//     title: "Finds Rates for Every Country",
//     time: "0 min",
//   },
// ];

export default function Home() {
  return (
    <>
      <Suspense>
        <TariffImpactHeader />
      </Suspense>
      <main>
        <TariffFeaturesGrid />

        <div className="h-8 bg-base-300"></div>
        <TrustedBy showTestimonials={false} />
        <div className="h-10 bg-base-300"></div>

        <TariffFeaturesListicle />

        {/* <Demo
          standoutPlacement="end"
          titleStandout=""
          title="See If Your Imports Are Affected By New Tariffs"
          subtitle="Instantly know which imports are affected by tariff updates"
          ctaText="Try it Now!"
          ctaLink="/tariffs/impact-checker"
          media={{
            title: "Tariff Impacts",
            description: "Tariff Impacts Demo",
            mediaType: "video",
            mediaPath: "/tariff-impact-demo.mp4",
            mediaFormat: "mp4",
            altText: "Tariff Impacts",
          }}
        />

        <div className="hidden md:block">
          <Demo
            standoutPlacement="start"
            titleStandout=""
            title="Get Notified When Tariffs Affect Your Imports"
            subtitle="Receive email notifications when new tariff announcements affect your imports"
            ctaText="Try it Now!"
            ctaLink="/tariffs/impact-checker"
            media={{
              title: "Tariff Impact Notification",
              description: "Tariff Impact Notification",
              mediaType: "image",
              mediaPath: "/tariff-impact-notification-desktop.svg",
              mediaFormat: "svg",
              altText: "Tariff Impact Notification",
            }}
          />
        </div>
        <div className="md:hidden">
          <Demo
            standoutPlacement="start"
            titleStandout=""
            title="Get Notified When Tariffs Affect Your Imports"
            subtitle="Get notified, see the impacts, and take action to save your bottom-line"
            ctaText="Try it Now!"
            ctaLink="/tariffs/impact-checker"
            media={{
              title: "Tariff Impact Notification",
              description: "Tariff Impact Notification",
              mediaType: "image",
              mediaPath: "/tariff-impact-notification-mobile.svg",
              mediaFormat: "svg",
              altText: "Tariff Impact Notification",
            }}
          />
        </div>

        <Demo
          standoutPlacement="end"
          titleStandout=""
          title="Discover Tariff Savings"
          subtitle="See the full list of tariffs for any import from any country & explore ways to save"
          ctaText="Try it Now!"
          ctaLink="/tariffs/impact-checker"
          media={{
            title: "Tariff Impacts",
            description: "Tariff Impacts Demo",
            mediaType: "video",
            mediaPath: "/impacts-and-options.mp4",
            mediaFormat: "mp4",
            altText: "Tariff Impacts",
          }}
        /> */}

        <WithWithout
          subject="Tariffs"
          title="Keeping up with Tariff Changes is a Nightmare"
          // subtitle="Automatically stay up to date with new tariffs and find ways to reduce your landed costs"
          // ctaText="Check your Imports"
          // ctaLink="/tariffs/impact-checker"
          // withKeyPoint={{
          //   title: "Clarity",
          //   detail: "No more guessing or waiting",
          // }}
          withoutKeyPoint={{
            title: "Error-Prone & Time-Consuming",
            // detail: "Manual, error-prone, time-consuming",
          }}
          // withList={withTariffImpact}
          withoutList={withoutTariffImpact}
        />

        <section className="relative w-full bg-base-100 px-4 sm:px-6 py-12 sm:py-20">
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
                src="https://www.youtube.com/embed/KZ6zv9ujarY?si=aEgVcGIC-gLfSMG4"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </section>

        <TariffImpactPricing />

        {/* <FAQ faqItems={tariffImpactFaqList} /> */}

        <PendingTariffsList />
      </main>
      <ClassifierFooter />
    </>
  );
}
