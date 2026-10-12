import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import * as mk from "@/components/ui/marketing/styles";
import { OFFER } from "../lib/offer";

// The closing offer: the same single button as the hero
export const OfferCta = () => (
  <section className="relative overflow-hidden bg-slate-950 py-28 text-white" aria-labelledby="offer-title">
    <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(44rem_22rem_at_50%_0%,rgba(45,212,191,0.3),transparent)]" />
    <div className={`${mk.container} relative flex flex-col items-center text-center`}>
      <h2 id="offer-title" className="max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl">
        Put the US tariff masters <span className={mk.accentDark}>on your imports.</span>
      </h2>
      <p className={`${mk.leadDark} mt-6 max-w-2xl`}>{OFFER.note}</p>
      <Link
        href={OFFER.href}
        className="group mt-10 inline-flex h-16 items-center gap-3 rounded-2xl bg-teal-400 px-10 text-lg font-extrabold text-slate-950 shadow-[0_0_60px_-10px_rgba(45,212,191,0.9)] transition-colors hover:bg-teal-300"
      >
        {OFFER.cta}
        <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </Link>
    </div>
  </section>
);
