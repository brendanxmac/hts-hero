import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { SectionHeader } from "@/components/ui/SectionHeader";
import * as ui from "@/components/ui/styles";
import { contactLink } from "../lib/links";

// The page-level call to action: for catalogs and teams that want a plan built with us
export const ClosingCta = () => (
  <section className={`${ui.card} flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between`}>
    <SectionHeader kicker="Large catalog or team?" title="Let's build a plan around your imports">
      Tracking thousands of products or rolling out classification across a
      compliance team? We&apos;ll price it to fit and help you get set up.
    </SectionHeader>
    <a href={contactLink("A plan for my team")} className={`${ui.button({ variant: "primary", size: "lg" })} lg:shrink-0`}>
      Talk to us
      <ArrowRightIcon className="h-4 w-4" aria-hidden />
    </a>
  </section>
);
