import { Suspense } from "react";
import { BreadcrumbsProvider } from "@/contexts/BreadcrumbsContext";
import { SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import { THEME_LIGHT } from "@/components/ui/theme";
import { TryItCard } from "./TryItCard";

// The hands-on demo: any product's duty history, then "Track this product free". It's built from
// the calculator's components, which are kept light here like the rest of the page.
export const TryItSection = () => (
  <section id="try-it" className={`${mk.band} scroll-mt-6`} aria-labelledby="try-it-title">
    <div className={`${mk.container} grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:items-start`}>
      <div className="lg:sticky lg:top-8">
        <SectionIntro eyebrow="Try it now" title="See every change to your product's duty" id="try-it-title">
          Pick an HTS code and country of origin. You&apos;ll see the duty on every verified HTS revision, what changed it
          and when. Then track it, free.
        </SectionIntro>
      </div>
      <div className={`${THEME_LIGHT} rounded-2xl bg-tt-soft p-4 sm:p-5`}>
        <BreadcrumbsProvider>
          <Suspense fallback={<div className="h-[32rem] rounded-xl bg-base-100" />}>
            <TryItCard />
          </Suspense>
        </BreadcrumbsProvider>
      </div>
    </div>
  </section>
);
