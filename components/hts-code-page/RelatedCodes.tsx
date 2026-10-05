import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import type { HtsElement } from "@/interfaces/hts";
import { mono } from "@/components/ui/font";
import { SectionHeader } from "@/components/ui/SectionHeader";
import * as ui from "@/components/ui/styles";

// The codes under this one and beside it. Plain links, so crawlers reach every line of the schedule
export function RelatedCodes({
  element,
  subCodes: children,
  siblings,
}: {
  element: HtsElement;
  subCodes: HtsElement[];
  siblings: HtsElement[];
}) {
  return (
    <section id="related-codes" className={ui.section}>
      <SectionHeader
        kicker="Related codes"
        title={children.length > 0 ? `HTS Codes Under ${element.htsno || "This Classification"}` : "Other HTS Codes at This Level"}
      />

      {children.length > 0 && (
        <ul className={`${ui.card} grid md:grid-cols-2`}>
          {children.map((child) => {
            const rate = child.general && child.general.length <= 20 ? child.general : null;
            const body = (
              <>
                <span className="min-w-0 flex-1">
                  <span className={`${mono.className} block text-sm font-semibold ${child.htsno ? "text-primary" : "text-base-content/60"}`}>
                    {child.htsno || "—"}
                  </span>
                  <span className={`${ui.bodySm} block`}>{child.description}</span>
                </span>
                {rate && (
                  <span className="shrink-0 rounded bg-base-200 px-2 py-0.5 text-xs font-semibold tabular-nums text-base-content">
                    {rate}
                  </span>
                )}
                {child.htsno && (
                  <ChevronRightIcon className="h-4 w-4 shrink-0 text-base-content/60 group-hover:text-primary" aria-hidden />
                )}
              </>
            );
            return (
              <li key={child.uuid} className="-mb-px border-b border-base-300 md:odd:border-r">
                {child.htsno ? (
                  <Link href={`/hts/${child.htsno}`} className="group flex h-full items-center gap-3 px-5 py-3 transition-colors hover:bg-base-200">
                    {body}
                  </Link>
                ) : (
                  <div className="flex h-full items-center gap-3 px-5 py-3">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {siblings.length > 0 && (
        <div className="flex flex-col gap-3">
          {children.length > 0 && (
            <h3 className={ui.label}>
              Other HTS Codes at This Level
            </h3>
          )}
          <div className="flex flex-wrap gap-2">
            {siblings.map((sib) =>
              sib.htsno ? (
                <Link
                  key={sib.uuid}
                  href={`/hts/${sib.htsno}`}
                  title={sib.description}
                  className="group inline-flex max-w-full items-center gap-2 rounded-md border border-base-300 bg-base-100 px-3 py-1.5 transition-colors hover:border-primary/40"
                >
                  <span className={`${mono.className} text-sm font-semibold text-primary`}>{sib.htsno}</span>
                  <span className="max-w-60 truncate text-sm text-base-content/70 group-hover:text-base-content">{sib.description}</span>
                </Link>
              ) : (
                <span
                  key={sib.uuid}
                  title={sib.description}
                  className="inline-flex items-center rounded-md border border-base-300 px-3 py-1.5 text-sm text-base-content/60"
                >
                  {sib.description.length > 30 ? sib.description.slice(0, 27) + "..." : sib.description}
                </span>
              )
            )}
          </div>
        </div>
      )}
    </section>
  );
}
