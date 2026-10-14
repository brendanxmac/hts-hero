import { SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import type { AuditExample } from "@/libs/tariff-audit-example";
import { RecalcTerminal } from "./RecalcTerminal";

// The audit, shown on one real entry: paid against owed, line by line, on a dark band
export const RecalcSection = ({ example }: { example: AuditExample | null }) => {
  if (!example) return null;
  return (
    <section className={`${mk.band} ${mk.bandDark} relative overflow-hidden`} aria-labelledby="recalc-title">
      <div className={`${mk.container} relative grid grid-cols-1 gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center`}>
        <SectionIntro eyebrow="How the audit works" title={<>Paid vs. owed, <span className={mk.accentDark}>line by line.</span></>} id="recalc-title" dark>
          Each entry line is recalculated with the rules in force on its entry date. Here, $40,000 of steel wire from China
          paid the 10% Section 122 duty, though Section 232 articles were exempt from it. Both sides are calculated by the
          HTS Hero tariff engine.
        </SectionIntro>
        <RecalcTerminal example={example} />
      </div>
    </section>
  );
};
