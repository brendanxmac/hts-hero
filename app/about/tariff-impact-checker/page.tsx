"use client";

import { Suspense } from "react";
import ClassifierFooter from "@/components/ClassifierFooter";
import TariffImpactFeaturesGrid from "@/components/TariffImpactFeaturesGrid";
import Demo from "@/components/Demo";
import { FAQ } from "@/components/FAQ";
import { tariffImpactFaqList } from "@/constants/faq";
import TariffAboutHeader from "@/components/TariffAboutHeader";
import { PendingTariffsList } from "../../../components/UpcomingTariffsList";
import TariffImpactPricing from "../../../components/TariffImpactPricing";
import TrustedBy from "../../../components/TrustedBy";

export default function Home() {
  return (
    <>
      <Suspense>
        <TariffAboutHeader />
      </Suspense>
      <main>
        <TariffImpactFeaturesGrid />
        <TrustedBy showTestimonials={false} />
        <div className="h-10 bg-base-200"></div>

        <Demo
          standoutPlacement="end"
          titleStandout=""
          title="See If New Tariffs Affect Your Imports"
          subtitle="Instantly know which imports are affected by new tariff updates"
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
            title="Know When Tariffs Affect Your Imports"
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
            title="Know When Tariffs Affect Your Imports"
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
          title="See Tariff Rates & Discover Savings"
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
        />
        <TariffImpactPricing />
        <FAQ faqItems={tariffImpactFaqList} />
        <PendingTariffsList />
      </main>
      <ClassifierFooter />
    </>
  );
}
