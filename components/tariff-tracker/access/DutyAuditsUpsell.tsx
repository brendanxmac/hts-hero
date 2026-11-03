"use client";

import { LockClosedIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { useTrackerAccess } from "./accessContext";
import { PremiumFeature } from "./features";

// Savings and Audits without Duty Guard Pro: the tab stays, with what it would find as a count and no
// details, and the upgrade (PRICING.md, decided 2026-10-31)
export const DutyAuditsUpsell = ({ feature, title, body, points }: { feature: PremiumFeature; title: string; body: string; points: string[] }) => {
  const { openUpgrade } = useTrackerAccess();
  return (
    <section className={`${tt.panel} flex flex-col items-start gap-4 p-6 lg:p-8`}>
      <span className={tt.eyebrow("primary")}>Included in Duty Guard Pro</span>
      <h2 className={`${tt.display} m-0 text-2xl font-semibold leading-snug text-base-content`}>{title}</h2>
      <p className={`${tt.subtitle} m-0 max-w-2xl`}>{body}</p>
      <ul className="m-0 flex list-disc flex-col gap-1.5 pl-5 text-sm text-base-content/75">
        {points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
      <button type="button" className={ui.button({ variant: "primary" })} onClick={() => openUpgrade(feature)}>
        <LockClosedIcon className="h-4 w-4" aria-hidden />
        Upgrade to Duty Guard Pro
      </button>
    </section>
  );
};
