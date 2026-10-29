import Image from "next/image";
import { Reveal, SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import logo from "@/app/logo.svg";

// "Keep 100% of Your Refunds", the page's second section and its biggest promise, as one picture:
// the same refund as two stacked bars. With HTS Hero, the bar is whole; with a recovery firm, it's
// what's left after their cut, shown in red at the end. HTS Hero finds and flags; the importer's team or broker files (we
// never file: unlicensed-find-flag-explain). The fee is PRICING.md's typical 15–30%, shown at 25%.

const REFUND = 50_000;
const FIRM_CUT = 0.25;
const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

// One row's bar face: what you keep, in soft green (yours), next to a small "You keep"
const KeepFace = ({ amount }: { amount: number }) => (
  <div className="flex h-full flex-col justify-center px-5 sm:flex-row sm:items-center sm:justify-start sm:gap-4 sm:px-7">
    <p className="whitespace-nowrap text-xs font-bold uppercase tracking-[0.18em] text-base-content/60">You Keep</p>
    <p className="text-3xl font-bold tabular-nums tracking-tight text-success sm:text-4xl [font-family:var(--font-tracker-display)]">{usd(amount)}</p>
  </div>
);

// Each row's label: on the left at desktop width, above its bar on phones
const rowLabel = "flex items-center gap-2 text-base font-semibold text-base-content [font-family:var(--font-tracker-display)] md:justify-end md:text-right";

export const KeepAllSection = () => {
  const fee = REFUND * FIRM_CUT;
  return (
    <section id="keep-100" className={`${mk.bandMuted} py-28 sm:py-40`} aria-labelledby="keep-title">
      <div className={mk.container}>
        <SectionIntro eyebrow="" title={<>Keep 100% of Your Refunds</>} id="keep-title" center>
          HTS Hero scans all your entries and flags possible over and underpayments. <br /> If you file a claim and get a refund, you keep 100%.
        </SectionIntro>

        {/* Where the numbers come from: one example refund, the same on both sides */}
        <p className="mt-14 text-center text-xl font-bold text-base-content sm:text-2xl [font-family:var(--font-tracker-display)]">
          For {usd(REFUND)} of possible refunds...
        </p>

        {/* Two bars on one left edge, like a bar chart: HTS Hero's runs the full width; the firm's
            stops short, and their cut fills the rest in red */}
        <Reveal className="mx-auto mt-10 grid max-w-4xl grid-cols-1 items-center gap-x-6 gap-y-3 md:grid-cols-[13rem_1fr] md:gap-y-5">
          <p className={rowLabel}>
            With <Image src={logo} alt="" width={20} height={20} /> HTS Hero
          </p>
          <div className="h-24 rounded-2xl bg-success/10 ring-1 ring-success/40" role="img" aria-label={`With HTS Hero, you keep all ${usd(REFUND)}`}>
            <KeepFace amount={REFUND} />
          </div>

          <p className={`${rowLabel} mt-6 md:mt-0`}>With a recovery firm</p>
          <div className="flex h-24 items-stretch" role="img" aria-label={`With a recovery firm at ${FIRM_CUT * 100}%, you keep ${usd(REFUND - fee)} and they take ${usd(fee)}`}>
            <div className="min-w-0 rounded-l-2xl bg-success/10 ring-1 ring-success/40" style={{ flex: `${1 - FIRM_CUT} 1 0` }}>
              <KeepFace amount={REFUND - fee} />
            </div>
            {/* Their cut */}
            <div
              className="ml-2 flex min-w-0 flex-col items-center justify-center rounded-r-2xl border-l-2 border-dashed border-error/60 bg-error/15 px-2 text-center text-error ring-1 ring-error/40"
              style={{ flex: `${FIRM_CUT} 1 0` }}
            >
              <p className="whitespace-nowrap text-base font-bold tabular-nums sm:text-xl [font-family:var(--font-tracker-display)]">−{usd(fee)}</p>
              <p className="text-xs font-semibold opacity-90">{FIRM_CUT * 100}% fee</p>
            </div>
          </div>
        </Reveal>

        <p className={`${mk.small} mx-auto mt-12 max-w-3xl text-center`}>
          Recovery firms typically keep 15–30% of every refund. <br /> HTS Hero finds and flags, you file and keep 100% of any refund.
        </p>
      </div>
    </section>
  );
};
