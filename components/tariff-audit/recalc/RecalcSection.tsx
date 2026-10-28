import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { SectionIntro } from "@/components/ui/marketing";
import * as cta from "@/components/ui/marketing/cta";
import * as mk from "@/components/ui/marketing/styles";
import type { AuditScan } from "@/libs/tariff-audit-example";
import { AuditUploadCard } from "./AuditUploadCard";

// How the audit works, for the person using it: a short promise and a button to the plans (like
// /tariff-alerts), beside one entry going in and its one plain answer coming back (AuditUploadCard),
// on a dark band
export const RecalcSection = ({ scans }: { scans: AuditScan[] }) => {
  // The overpaid example: the answer most people come for
  const scan = scans.find((s) => s.verdict === "overpaid");
  if (!scan) return null;
  return (
    <section id="how-it-works" className={`${mk.band} ${mk.bandDark} relative overflow-hidden`} aria-labelledby="recalc-title">
      <div className={`${mk.container} relative grid grid-cols-1 gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center`}>
        <div>
          <SectionIntro eyebrow="How the audit works" title={<>Upload Your Entry. <br /><span className={mk.accentDark}>Get Results.</span></>} id="recalc-title" dark>
            Take 30 seconds to upload your entry details and get a clear answer. No onboarding and no consultants.
          </SectionIntro>
          <div className="mt-10">
            <Link href="#pricing" className={cta.buttonPrimarySm}>
              Get Started <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>
        </div>
        <AuditUploadCard scan={scan} />
      </div>
    </section>
  );
};
