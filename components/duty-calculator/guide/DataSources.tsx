import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";
import * as ui from "@/components/ui/styles";
import { CHANGELOG_PATH } from "../changelog/constants";
import { historyStartDate, historyStartRevision } from "./faqs";
import { NotIncluded } from "./NotIncluded";
import { WhatsIncluded } from "./WhatsIncluded";

// Where the rates come from, what the calculator covers and what it leaves out
export const DataSources = ({ revisionTitle, asOf }: { revisionTitle: string; asOf: string }) => (
  <section id="sources" className={ui.section}>
    <SectionHeader kicker="Data" title="Where the rates come from">
      Every rate comes from the official Harmonized Tariff Schedule of the United States published
      by the US International Trade Commission. Each HTS revision&apos;s changes are entered with
      the dates they take effect, so you can calculate past and future entry dates. Tariff data is
      verified from {historyStartRevision} ({historyStartDate}) through {revisionTitle}, and every change is listed
      in the <Link href={CHANGELOG_PATH} className={ui.link}>calculator changelog</Link>.
    </SectionHeader>

    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <WhatsIncluded asOf={asOf} />
      <NotIncluded />
    </div>
  </section>
);
