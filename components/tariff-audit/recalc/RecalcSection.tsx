import { EntryCta } from "@/components/onboarding/EntryCta";
import { ArrowRightIcon, CheckIcon } from "@heroicons/react/20/solid";
import { SectionIntro } from "@/components/ui/marketing";
import * as cta from "@/components/ui/marketing/cta";
import * as mk from "@/components/ui/marketing/styles";
import { SetupCard } from "./SetupCard";

// "Get Set Up in 30 Seconds": how quick it is to start, in one centered picture (SetupCard: a
// spreadsheet of entries drops in, is added, and the audit is one click away), then the same thing
// in two steps and a button to the plans, like /tariff-alerts' "Get Started in 30 Seconds". On a
// dark band.


export const RecalcSection = () => (
  <section id="how-it-works" className={`${mk.band} ${mk.bandDark} relative overflow-hidden`} aria-labelledby="recalc-title">
    <div className={`${mk.container} relative flex flex-col items-center`}>
      <SectionIntro eyebrow="" title={<>Get Started in <span className={mk.accentDark}>30 Seconds</span></>} id="recalc-title" dark center>
        Upload your products and you&apos;re ready to go. No onboarding, no consultants and no handoffs.
      </SectionIntro>

      <div className="mt-14 w-full max-w-xl">
        <SetupCard />
      </div>

      <div className="mt-10">
        <EntryCta page="duty-audits" entry="audits_page" section="setup" label="Get Started" className={cta.buttonPrimarySm}>
          Get Started <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </EntryCta>
      </div>
    </div>
  </section>
);
