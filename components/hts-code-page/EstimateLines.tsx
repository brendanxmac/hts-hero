import Link from "next/link";
import type { MicroEstimate } from "@/libs/hts-micro-estimate";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";

// Under the estimate's cost bar: the Chapter 99 line behind each tariff, linked to its own page,
// and the program's page where it has one. Adds to the legend above; it doesn't repeat the rates.
export const EstimateLines = ({ lines }: { lines: MicroEstimate["lines"] }) => {
  if (!lines.length) return null;
  return (
    <div className="border-t border-base-300 px-6 py-3">
      <p className={`${ui.caption} m-0 flex flex-wrap items-baseline gap-x-4 gap-y-1`}>
        <span className="font-semibold text-base-content/70">Chapter 99 lines</span>
        {lines.map((line) => (
          <span key={line.code} className="inline-flex flex-wrap items-baseline gap-x-1.5">
            <Link href={`/hts/${line.code}`} className={`${mono.className} ${ui.link}`}>
              {line.code}
            </Link>
            {line.programHref ? (
              <Link href={line.programHref} className="text-base-content/70 underline-offset-4 hover:text-primary hover:underline">
                {line.name}
              </Link>
            ) : (
              <span>{line.name}</span>
            )}
          </span>
        ))}
      </p>
    </div>
  );
};
