import { EntryCta } from "@/components/onboarding/EntryCta";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { SectionIntro } from "@/components/ui/marketing";
import * as cta from "@/components/ui/marketing/cta";
import * as mk from "@/components/ui/marketing/styles";
import { PROMISES } from "../lib/copy";
import { QuickStart } from "./QuickStart";

// How quick and easy it is to start, in one picture (QuickStart), then the button

export const HowItWorks = () => (
  <section id="how-it-works" className={`${mk.band} ${mk.bandMuted}`} aria-labelledby="how-title">
    <div className={`${mk.container} flex flex-col gap-14`}>
      <SectionIntro eyebrow="" title="Get Started in 30 Seconds" id="how-title" center>
        Just upload your products and you&apos;re good to go!
      </SectionIntro>
      <QuickStart />
      <div className="flex flex-col items-center gap-3">
        <EntryCta page="tariff-alerts" entry="alerts_page" section="how_it_works" label="Get Started" className={cta.buttonPrimarySm}>
          Get Started <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </EntryCta>
        <p className={mk.small}>{PROMISES.join(" · ")}</p>
      </div>
    </div>
  </section>
);
