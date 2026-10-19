import { Suspense } from "react";
import { TrackerApp } from "@/components/tariff-tracker";

// Temporary: the Tracker without the sign-in redirect, for checking layouts. Delete after.
export default function Page() {
  return (
    <Suspense fallback={null}>
      <TrackerApp />
    </Suspense>
  );
}
