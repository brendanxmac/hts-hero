import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import type { HtsElement } from "@/interfaces/hts";
import { mono } from "@/components/ui/font";
import { CardSection } from "./CardSection";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";

// The codes under this one and beside it, each a two-column list of links (code, description,
// rate), so crawlers reach every line of the schedule. The codes beside it are a sub-section when
// there are codes under it too.

const CodeList = ({ codes }: { codes: HtsElement[] }) => (
  <ul className="m-0 grid list-none overflow-hidden p-0 md:grid-cols-2 md:[&>li:nth-child(odd):last-child]:col-span-2 md:[&>li:nth-child(odd):last-child]:border-r-0">
    {codes.map((code) => {
      const rate = code.general && code.general.length <= 20 ? code.general : null;
      const body = (
        <>
          <span className="min-w-0 flex-1">
            <span className={`${mono.className} block text-sm font-semibold ${code.htsno ? "text-primary" : "text-base-content/60"}`}>{code.htsno || "—"}</span>
            <span className={`${ui.bodySm} block`}>{code.description}</span>
          </span>
          {rate && <span className="shrink-0 rounded-full bg-tt-soft px-2.5 py-0.5 text-xs font-semibold tabular-nums text-base-content">{rate}</span>}
          {code.htsno && <ChevronRightIcon className="h-4 w-4 shrink-0 text-base-content/60 group-hover:text-primary" aria-hidden />}
        </>
      );
      return (
        <li key={code.uuid} className="-mb-px border-b border-base-300 md:odd:border-r">
          {code.htsno ? (
            <Link href={`/hts/${code.htsno}`} className="group flex h-full items-center gap-3 px-6 py-4 transition-colors hover:bg-tt-soft">
              {body}
            </Link>
          ) : (
            <div className="flex h-full items-center gap-3 px-6 py-4">{body}</div>
          )}
        </li>
      );
    })}
  </ul>
);

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
    <CardSection
      id="related-codes"
      kicker="Related codes"
      title={children.length > 0 ? `HTS Codes Under ${element.htsno || "This Classification"}` : "Other HTS Codes at This Level"}
    >
      {children.length > 0 && <CodeList codes={children} />}

      {siblings.length > 0 &&
        (children.length > 0 ? (
          <div className="border-t border-base-300">
            <h3 className={`${tt.title} m-0 bg-tt-soft px-6 py-3.5 text-[0.95rem]`}>Other HTS Codes at This Level</h3>
            <div className="border-t border-base-300">
              <CodeList codes={siblings} />
            </div>
          </div>
        ) : (
          <CodeList codes={siblings} />
        ))}
    </CardSection>
  );
}
