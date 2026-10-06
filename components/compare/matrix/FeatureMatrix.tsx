import Link from "next/link";
import { FEATURES } from "@/libs/compare/features";
import type { Tool } from "@/libs/compare/types";
import * as ui from "@/components/ui/styles";
import { formatPostDate } from "@/components/blog";
import { SupportMark } from "./SupportMark";

// Every comparison feature down the side, one column per tool. HTS Hero's column is
// highlighted; the first column stays put while the table scrolls sideways on a phone.
export function FeatureMatrix({
  tools,
  linkFor,
}: {
  tools: Tool[];
  // Where each tool's name links, when it has its own comparison page
  linkFor?: (tool: Tool) => string | undefined;
}) {
  const checkedAt = tools.map((t) => t.checkedAt).sort()[0];
  return (
    <div className={ui.card}>
      <div className="overflow-x-auto">
        {/* Narrower than this, the tool columns crush their notes; the table scrolls instead */}
        <table className="w-full min-w-[40rem] text-sm">
          <thead className="bg-base-200">
            <tr>
              <th scope="col" className={`${ui.label} sticky left-0 z-10 w-64 bg-base-200 px-5 py-3 text-left`}>
                Feature
              </th>
              {tools.map((tool) => {
                const href = linkFor?.(tool);
                const ours = tool.slug === "hts-hero";
                return (
                  <th
                    key={tool.slug}
                    scope="col"
                    className={`min-w-40 px-4 py-3 text-left align-bottom last:pr-5 ${ours ? "bg-primary/10" : ""}`}
                  >
                    <span className="flex flex-col gap-1">
                      {ours && <span className={`${ui.badge("primary")} w-fit`}>Our tool</span>}
                      {href ? (
                        <Link href={href} className="text-sm font-semibold text-base-content hover:text-primary">
                          {tool.name}
                        </Link>
                      ) : (
                        <span className="text-sm font-semibold text-base-content">{tool.name}</span>
                      )}
                      <span className="text-xs font-medium text-base-content/60">{tool.price}</span>
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {FEATURES.map((feature) => (
              <tr key={feature.key} className="border-t border-base-300">
                <th scope="row" className="sticky left-0 z-10 bg-base-100 px-5 py-3 text-left align-top font-normal">
                  <span className="block font-medium text-base-content">{feature.label}</span>
                  <span className={`${ui.caption} block`}>{feature.help}</span>
                </th>
                {tools.map((tool) => (
                  <td
                    key={tool.slug}
                    className={`px-4 py-3 align-top last:pr-5 ${tool.slug === "hts-hero" ? "bg-primary/5" : ""}`}
                  >
                    <SupportMark value={tool.features[feature.key]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={`${ui.cardFooter} ${ui.caption}`}>
        Checked against each tool&apos;s public website on {formatPostDate(checkedAt)}. &ldquo;Not found&rdquo; means we
        couldn&apos;t find it on the vendor&apos;s public pages, so we don&apos;t count it either way.
      </div>
    </div>
  );
}
