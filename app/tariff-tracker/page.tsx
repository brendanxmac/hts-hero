import { Suspense } from "react";
import { Metadata } from "next";
import { TrackerApp } from "@/components/tariff-tracker";
import { REVERSE_TRIAL } from "@/components/pricing-calculator/lib/pricing";

export const metadata: Metadata = {
  title: "Tariff Tracker | HTS Hero",
  description: `Track the US tariff rate on every product you import. Paste your HTS codes and countries of origin to see each product's current duty rate and the tariffs behind it, and get an alert when a change hits one. Free for ${REVERSE_TRIAL.days} days on up to ${REVERSE_TRIAL.imports} imports, no credit card.`,
  // ?tab= variants are the same page
  alternates: { canonical: "/tariff-tracker" },
  // The app itself has little for search engines; /tariff-monitor is the page that explains it
  robots: { index: false, follow: true },
};

export default function TariffTrackerPage() {
  return (
    // TrackerApp reads ?tab= (useSearchParams), which needs a Suspense boundary
    <Suspense fallback={<div className="h-svh bg-base-200" />}>
      <TrackerApp />
    </Suspense>
  );
}
