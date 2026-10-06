import { Suspense } from "react";
import { Metadata } from "next";
import { TrackerApp } from "@/components/tariff-tracker";

export const metadata: Metadata = {
  title: "Tariff Tracker | HTS Hero",
  description:
    "Track the US tariff rate on every product you import. Paste your HTS codes and countries of origin to see each product's current duty rate, the tariffs behind it, and ways to lower it.",
  // ?tab= variants are the same page
  alternates: { canonical: "/tariff-tracker" },
};

export default function TariffTrackerPage() {
  return (
    // TrackerApp reads ?tab= (useSearchParams), which needs a Suspense boundary
    <Suspense fallback={<div className="h-svh bg-base-200" />}>
      <TrackerApp />
    </Suspense>
  );
}
