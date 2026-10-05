import Link from "next/link";
import { ArrowRightIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { SectionHeader } from "@/components/ui/SectionHeader";
import * as ui from "@/components/ui/styles";

// The call to action: every rate depends on the code, so send people to find theirs
export const FindHtsCode = () => (
  <section
    id="find-hts-code"
    aria-labelledby="find-hts-code-title"
    className={`${ui.card} scroll-mt-6 px-6 py-8 sm:px-10 sm:py-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center`}
  >
    <SectionHeader kicker="Classification" title="Find the right HTS code for your products" titleId="find-hts-code-title">
      Every rate on this page depends on the 10-digit classification. The wrong code can mean the
      wrong tariffs, missed exemptions, and penalties.
    </SectionHeader>
    <div className="flex flex-wrap gap-3">
      <Link href="/explore" className={ui.button({ size: "lg" })}>
        <MagnifyingGlassIcon className="h-4 w-4" aria-hidden />
        Search the HTS
      </Link>
      <Link href="/classify" className={ui.button({ variant: "primary", size: "lg" })}>
        Classify a product
        <ArrowRightIcon className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  </section>
);
