import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";

// For a line with no rates (e.g. a heading above the rate lines): still offer the calculator
export function CalculatorPrompt({ htsno }: { htsno: string }) {
  return (
    <aside className={`${ui.card} p-5 flex flex-col gap-3`}>
      <p className={ui.cardTitle}>Importing under {htsno}?</p>
      <p className="text-sm leading-relaxed text-base-content/70">
        Pick the full HTS code in the calculator to see every duty, tariff and exemption for your country of origin.
      </p>
      <Link href={`/duty-calculator?code=${htsno}`} className={ui.button({ variant: "primary", size: "sm" })}>
        Calculate Total Duty
        <ArrowRightIcon className="h-4 w-4" aria-hidden />
      </Link>
    </aside>
  );
}
