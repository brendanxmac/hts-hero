import Link from "next/link";
import { SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import { USITC_HTS_URL } from "@/libs/official-sources";
import { CHANGELOG_PATH } from "../changelog/constants";
import { historyStartDate, historyStartRevision } from "./faqs";
import { NotIncluded } from "./NotIncluded";
import { WhatsIncluded } from "./WhatsIncluded";

// Where the rates come from, what the calculator covers and what it leaves out
export const DataSources = ({ revisionTitle, asOf }: { revisionTitle: string; asOf: string }) => (
  <section id="sources" className={`${mk.band} scroll-mt-6`}>
    <div className={`${mk.container} flex flex-col gap-12`}>
      <SectionIntro eyebrow="Data" title="Where the rates come from">
        Every rate comes from the official{" "}
        <a href={USITC_HTS_URL} target="_blank" rel="noopener noreferrer" className={mk.link}>
          Harmonized Tariff Schedule of the United States
        </a>{" "}
        published by the US International Trade Commission. Each HTS revision&apos;s changes are entered with
        the dates they take effect, so you can calculate past and future entry dates. Tariff data is
        verified from {historyStartRevision} ({historyStartDate}) through {revisionTitle}, and every change is listed
        in the <Link href={CHANGELOG_PATH} className={mk.link}>calculator changelog</Link>.
      </SectionIntro>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <WhatsIncluded asOf={asOf} />
        <NotIncluded />
      </div>
    </div>
  </section>
);
