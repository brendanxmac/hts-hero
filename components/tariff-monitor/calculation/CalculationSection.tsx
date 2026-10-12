import { SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import type { WorkedExample } from "@/libs/duty-calculator-content";
import { CalculationTerminal } from "./CalculationTerminal";

// Accuracy, shown: a real duty calculation with the legal source of every line, on a dark band
export const CalculationSection = ({ example, revision }: { example: WorkedExample | null; revision: string }) => {
  if (!example) return null;
  return (
    <section className={`${mk.band} ${mk.bandDark} relative overflow-hidden`} aria-labelledby="calculation-title">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(50rem_24rem_at_85%_0%,rgba(45,212,191,0.12),transparent)]" />
      <div className={`${mk.container} relative grid grid-cols-1 gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center`}>
        <SectionIntro
          eyebrow="Accuracy"
          title={<>Every line of duty. <span className={mk.accentDark}>Every legal source.</span></>}
          id="calculation-title"
          dark
        >
          The Tracker works out the full US duty on each product, line by line: the base rate, each Chapter 99 tariff
          with its heading, exemptions, trade preferences and fees. This is a live calculation from today&apos;s tariff
          data.
        </SectionIntro>
        <CalculationTerminal example={example} revision={revision} />
      </div>
    </section>
  );
};
