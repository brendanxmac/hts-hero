import { TrackedLink } from "@/components/ui/TrackedLink";
import { MixpanelEvent } from "@/libs/mixpanel";
import { ArrowRightIcon, CheckIcon } from "@heroicons/react/20/solid";
import type { CtaKind } from "@/libs/blog/types";
import * as ui from "@/components/ui/styles";
import { CTA_CONTENT } from "./ctaContent";

// The post's tool pitch in the article rail, beside the reading
export function RailCta({ kind }: { kind: CtaKind }) {
  const cta = CTA_CONTENT[kind];
  return (
    <aside className={ui.card}>
      <div className="flex flex-col gap-3 p-5">
        <span className={ui.kicker}>{cta.kicker}</span>
        <p className="text-lg font-semibold leading-snug tracking-tight text-base-content">{cta.title}</p>
        <ul className="flex flex-col gap-2">
          {cta.points.map((point) => (
            <li key={point} className={`${ui.bodySm} flex items-start gap-2`}>
              <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
              {point}
            </li>
          ))}
        </ul>
      </div>
      <div className={ui.cardFooter}>
        <TrackedLink href={cta.href} event={kind === "tracker" ? MixpanelEvent.SIGNUP_CTA_CLICKED : MixpanelEvent.BLOG_CTA_CLICKED} properties={{ page: "blog", section: `cta_rail`, kind, label: cta.button }} className={`${ui.button({ variant: "primary" })} w-full`}>
          {cta.button}
          <ArrowRightIcon className="h-4 w-4" aria-hidden />
        </TrackedLink>
      </div>
    </aside>
  );
}
