import Link from "next/link";
import { ArrowRightIcon, CheckIcon } from "@heroicons/react/20/solid";
import * as tt from "@/components/ui/styles/tracker";
import * as mk from "@/components/ui/marketing/styles";
import { CHANGELOG_PATH } from "../changelog/constants";

// The top of /duty-calculator, in Duty Guard's look (DESIGN_SYSTEM.md §15): the headline
// centered under a bar saying the rates are current (with the data changelog), and what the
// calculator covers, short enough that the calculator sits high on the page. Server-rendered
// so crawlers see the copy and the links. Follows light and dark with the site. The latest tariff
// actions sit under the calculator for now (TariffNewsBand).

const COVERS = ["Section 122, 201, 232, 301, & 338 tariffs", "USMCA & other trade programs", "MPF & HMF fees", "Antidumping & countervailing duties", "No sign-up required"];

export const Hero = ({ revisionTitle }: { revisionTitle: string }) => (
  <header className="relative isolate -mt-2 overflow-hidden">
    {/* Across the top: the rates are current, with the data changelog */}
    <p className="m-0 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 border-b border-primary/15 bg-primary/10 px-4 py-2 text-center text-sm text-base-content/80">
      <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
      Up to date with {revisionTitle}.
      <Link href={CHANGELOG_PATH} className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
        Track our updates
        <ArrowRightIcon className="h-3 w-3" aria-hidden />
      </Link>
    </p>
    {/* The glow is for dark mode only: on a light page it reads as a smudge */}
    <div className="absolute left-1/2 top-0 -z-10 hidden h-72 w-[56rem] max-w-full -translate-x-1/2 rounded-full bg-primary/15 blur-[100px] follow-dark:block" aria-hidden />
    <div className={`${mk.container} flex flex-col items-center gap-5 pb-10 pt-12 text-center`}>
      <h1 className="m-0 flex max-w-5xl flex-col items-center gap-4">
        <span className={tt.eyebrow("primary")}>Free US Import Duty &amp; Tariff Calculator</span>
        <span className={`${tt.display} text-4xl font-semibold leading-tight tracking-tight text-base-content sm:text-6xl sm:leading-[1.05]`}>
          US Tariff Calculator
        </span>
      </h1>
      <p className="m-0 max-w-3xl text-base leading-relaxed text-base-content/70 sm:text-lg sm:leading-7">
        See every tariff, exemption, and fee in effect for your imports, line by line with legal source.
      </p>
      <ul className="m-0 flex list-none flex-wrap justify-center gap-2 p-0">
        {COVERS.map((item) => (
          <li key={item} className="flex items-center gap-1.5 rounded-full border border-base-300 bg-base-100 px-3 py-1 text-sm font-medium text-base-content/80 shadow-xs">
            <CheckIcon className="h-3.5 w-3.5 text-success" aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </div>
  </header>
);
