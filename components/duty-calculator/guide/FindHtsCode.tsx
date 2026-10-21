import Link from "next/link";
import { ArrowRightIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import * as mk from "@/components/ui/marketing/styles";
import * as tt from "@/components/ui/styles/tracker";

// The call to action: every rate depends on the code, so send people to find theirs. A dark band
// in the Tariff Tracker's dark palette (hts-tracker-on-dark: navy, indigo), for contrast between
// the light sections around it, in light mode and dark.
export const FindHtsCode = () => (
  <section
    id="find-hts-code"
    aria-labelledby="find-hts-code-title"
    className={`${mk.band} hts-tracker-on-dark relative scroll-mt-6 overflow-hidden bg-tt-side text-base-content`}
  >
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(44rem_22rem_at_85%_0%,color-mix(in_oklab,var(--color-primary)_30%,transparent),transparent),radial-gradient(30rem_18rem_at_0%_100%,color-mix(in_oklab,var(--color-primary)_12%,transparent),transparent)]"
    />
    <div className={`${mk.container} relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center`}>
      <div className="flex max-w-3xl flex-col gap-4">
        <span className={tt.eyebrow("primary")}>Classification</span>
        <h2 id="find-hts-code-title" className={`${tt.display} m-0 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl sm:leading-none`}>
          Find the right HTS code for your imports, fast.
        </h2>
        <p className="m-0 text-lg leading-relaxed text-base-content/70">
          Every rate on this page depends on the 10-digit classification. The wrong code can mean the wrong tariffs, missed exemptions, and penalties.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        {/* <Link href="/explore" className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-base-content/20 px-6 font-semibold text-base-content transition-colors hover:bg-base-content/10">
          <MagnifyingGlassIcon className="h-4 w-4" aria-hidden />
          Search the HTS
        </Link> */}
        <Link href="/classify" className="btn-wide inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-content transition-colors hover:bg-primary/90">
          Find Code
          <ArrowRightIcon className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </div>
  </section>
);
