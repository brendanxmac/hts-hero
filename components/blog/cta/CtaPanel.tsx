import Link from "next/link";
import { ArrowRightIcon, CheckIcon } from "@heroicons/react/20/solid";
import type { CtaKind } from "@/libs/blog/types";
import * as ui from "@/components/ui/styles";
import { CTA_CONTENT } from "./ctaContent";

// A page-level call to action: the pitch and the button on the left, what you get on the right.
// Used at the end of posts, inside them (<Cta kind="…" />) and on the blog index.
export function CtaPanel({ kind, secondary }: { kind: CtaKind; secondary?: { href: string; label: string } }) {
  const cta = CTA_CONTENT[kind];
  return (
    <section className={ui.card}>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="flex flex-col gap-3 p-6 sm:p-8">
          <span className={ui.kicker}>{cta.kicker}</span>
          <p className={ui.sectionTitle}>{cta.title}</p>
          <p className={`${ui.body} max-w-prose`}>{cta.body}</p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Link href={cta.href} className={ui.button({ variant: "primary", size: "lg" })}>
              {cta.button}
              <ArrowRightIcon className="h-4 w-4" aria-hidden />
            </Link>
            {secondary && (
              <Link href={secondary.href} className={ui.button({ size: "lg" })}>
                {secondary.label}
              </Link>
            )}
          </div>
        </div>
        <div className="flex flex-col justify-center border-t border-base-300 bg-base-200 p-6 sm:p-8 lg:border-l lg:border-t-0">
          <p className={`${ui.label} mb-4`}>What you get</p>
          <ul className="flex flex-col gap-3">
            {cta.points.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-base text-base-content">
                <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-success" aria-hidden />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
