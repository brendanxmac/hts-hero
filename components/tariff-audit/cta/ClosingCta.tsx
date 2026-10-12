import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import * as mk from "@/components/ui/marketing/styles";
import { REQUEST_ANCHOR, SIGN_UP_TO_AUDIT } from "../lib/links";

export const ClosingCta = () => (
  <section className="relative overflow-hidden bg-slate-950 py-24 text-white" aria-labelledby="closing-title">
    <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(40rem_20rem_at_50%_0%,rgba(52,211,153,0.22),transparent)]" />
    <div className={`${mk.container} relative flex flex-col items-center text-center`}>
      <h2 id="closing-title" className={`${mk.h2Dark} max-w-3xl`}>
        Refund deadlines run <span className={mk.accentDark}>entry by entry.</span>
      </h2>
      <p className={`${mk.leadDark} mt-5 max-w-2xl`}>
        Protests are due 180 days after liquidation, and many refunds depend on acting before it. Check your entries now.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link href={SIGN_UP_TO_AUDIT} className={mk.buttonOnDark}>
          Audit free for 14 days <ArrowRightIcon className="h-4 w-4" aria-hidden />
        </Link>
        <a href={REQUEST_ANCHOR} className={mk.buttonGhostDark}>
          Request an audit
        </a>
      </div>
    </div>
  </section>
);
