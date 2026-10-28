import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { PRICING_HREF } from "../lib/nav";
import { SectionIntro } from "@/components/ui/marketing";
import * as cta from "@/components/ui/marketing/cta";
import * as mk from "@/components/ui/marketing/styles";
import type { AlertExample } from "@/libs/tariff-alerts-example";
import { PROMISES } from "../lib/copy";
import { EarlyTimeline } from "./EarlyTimeline";

// "Get Alerted, Early!": a real tariff, from the day we alerted to the day its duty started, and
// the head start in between (EarlyTimeline), then the button. The latest real actions are their own
// section (latest/LatestActions.tsx).

export const EarlySection = ({ example }: { example: AlertExample | null }) => (
  <section id="early" className={`${mk.band} ${mk.bandMuted}`} aria-labelledby="early-title">
    <div className={`${mk.container} flex flex-col gap-12`}>
      <SectionIntro eyebrow="" title="Get Tariff Alerts, As Early As Possible" id="early-title" center>
        Most tariffs changes are proposed weeks before they hit your entries. <br /> We notify you right when they&apos;re proposed and again when published.
      </SectionIntro>
      {example && <EarlyTimeline example={example} />}
      <div className="flex flex-col items-center gap-3">
        <Link href={PRICING_HREF} className={cta.buttonPrimary}>
          Get Tariff Alerts <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
        <p className={mk.small}>{PROMISES.join(" · ")}</p>
      </div>
    </div>
  </section>
);
