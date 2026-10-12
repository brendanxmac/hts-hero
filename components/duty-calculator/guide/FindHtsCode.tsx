import Link from "next/link";
import { ArrowRightIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";

// The call to action: every rate depends on the code, so send people to find theirs. A dark
// band, for contrast between the two white sections around it.
export const FindHtsCode = () => (
  <section
    id="find-hts-code"
    aria-labelledby="find-hts-code-title"
    className={`${mk.band} relative scroll-mt-6 overflow-hidden bg-[#0b1220] text-white`}
  >
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(40rem_20rem_at_85%_0%,rgba(45,212,191,0.18),transparent)]"
    />
    <div className={`${mk.container} relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center`}>
      <SectionIntro dark eyebrow="Classification" title="Find the right HTS code for your products" id="find-hts-code-title">
        Every rate on this page depends on the 10-digit classification. The wrong code can mean the
        wrong tariffs, missed exemptions, and penalties.
      </SectionIntro>
      <div className="flex flex-wrap gap-4">
        <Link href="/explore" className={mk.buttonGhostDark}>
          <MagnifyingGlassIcon className="h-4 w-4" aria-hidden />
          Search the HTS
        </Link>
        <Link href="/classify" className={mk.buttonOnDark}>
          Classify a product
          <ArrowRightIcon className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </div>
  </section>
);
