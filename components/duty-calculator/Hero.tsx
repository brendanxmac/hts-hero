import Link from "next/link";
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- for the commented-out hero sections
  ArrowRightIcon,
  CalculatorIcon,
  ClockIcon,
  RectangleStackIcon,
} from "@heroicons/react/24/outline";
import { Countries } from "../../constants/countries";
import { AllRules } from "../../tariffs/engine-v2/data";
import { HtsRevision } from "../../tariffs/engine-v2/revisions";
import { ChangelogEntry } from "@/libs/supabase/tariff-changelog";
import { ChangelogCard } from "./Changelog";

// The top of /duty-calculator. Server-rendered so crawlers see the copy; the tools follow.

// The tool tabs; ?tool= picks one
const TOOLS_ANCHOR = "#tariff-tools";
const CALCULATOR_HREF = `/duty-calculator${TOOLS_ANCHOR}`;
const WATCHER_HREF = `/duty-calculator?tool=watcher${TOOLS_ANCHOR}`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- for the commented-out capability cards
const CAPABILITIES = [
  {
    Icon: CalculatorIcon,
    title: "Calculate any entry",
    text: "The base rate plus every Section 232, 301 and 122 tariff, exemption, trade preference and customs fee, each with the reason it applies.",
    href: CALCULATOR_HREF,
  },
  {
    Icon: ClockIcon,
    title: "Audit past imports",
    text: "Set any past entry date to check what you should have paid, and see exactly when and why the rate changed.",
    href: CALCULATOR_HREF,
  },
  {
    Icon: RectangleStackIcon,
    title: "Track your whole catalog",
    text: "Paste your product list to see every rate at once, export to Excel, and find exemptions worth claiming.",
    href: WATCHER_HREF,
  },
];

export const Hero = ({
  latestVerified,
  latestUpdates,
}: {
  latestVerified: HtsRevision;
  latestUpdates: ChangelogEntry[];
}) => {
  const headings = new Set(AllRules.tariffs.map((t) => t.code)).size;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- for the commented-out stats
  const stats = [
    { value: "23,000+", label: "HTS codes" },
    { value: String(Countries.length), label: "countries of origin" },
    { value: String(headings), label: "Chapter 99 tariffs & exemptions" },
    {
      value: latestVerified.title.replace(
        /^Revision (\d+) \((\d{4})\)$/,
        "$2 Rev $1",
      ),
      label: "latest HTS revision verified",
    },
  ];

  return (
    <div
      className="w-full"
      style={{
        background:
          "radial-gradient(70% 90% at 0% 0%, var(--dc-accent-soft), transparent 70%)",
      }}
    >
      <header className="mx-auto grid w-full max-w-[1440px] gap-8 px-4 sm:px-6 pt-10 pb-10 md:pt-14 md:pb-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12 xl:gap-16">
        <div className="min-w-0">
          <h1 className="mt-5">
            <span className="block text-[13px] sm:text-[14px] font-semibold uppercase tracking-[0.12em] text-[var(--dc-accent)]">
              US Import Duty &amp; Tariff Calculator
            </span>
            <span className="mt-3 block max-w-[20ch] text-[36px] leading-[1.05] sm:text-[48px] lg:text-[56px] font-semibold tracking-[-0.03em] text-[var(--dc-text)]">
              Know exactly what you owe on every import.{" "}
              <span className="text-[var(--dc-accent)]">And why.</span>
            </span>
          </h1>

          <p className="mt-5 max-w-[62ch] text-[16px] sm:text-[17.5px] leading-relaxed text-[var(--dc-text-2)]">
            Enter an{" "}
            <Link
              href="/explore"
              className="font-semibold text-[var(--dc-text)] underline decoration-[var(--dc-border-strong)] underline-offset-4 hover:decoration-[var(--dc-accent)]"
            >
              HTS code
            </Link>{" "}
            and country of origin. We find every tariff, exemption and fee in
            effect on your entry date, itemized line by line with its legal
            source, and kept current with every HTS revision.
          </p>

          {/* <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href={CALCULATOR_HREF}
              className={`${styles.buttonPrimary} !h-11 !px-5 !text-[15px]`}
            >
              Calculate duty
              <ArrowRightIcon className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href={WATCHER_HREF}
              className={`${styles.button} !h-11 !px-5 !text-[15px]`}
            >
              Track your products
            </Link>
            <span className="text-[13.5px] text-[var(--dc-text-3)]">
              Free. No sign-up.
            </span>
          </div> */}

          {/* <ul className="mt-9 grid gap-3 sm:grid-cols-3">
            {CAPABILITIES.map(({ Icon, title, text, href }) => (
              <li key={title}>
                <Link
                  href={href}
                  className="group flex h-full gap-3 sm:flex-col sm:gap-2 rounded-[10px] border border-[var(--dc-border)] bg-[var(--dc-surface)] p-4 shadow-[var(--dc-shadow)] transition-[border-color,transform] hover:-translate-y-0.5 hover:border-[var(--dc-accent-border)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--dc-accent)]"
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--dc-accent-soft)] text-[var(--dc-accent)]"
                    aria-hidden
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="flex min-w-0 flex-col gap-1 sm:gap-2">
                    <span className="flex items-center gap-1 text-[15px] font-semibold text-[var(--dc-text)]">
                      {title}
                      <ArrowRightIcon
                        className="h-3.5 w-3.5 text-[var(--dc-accent)] opacity-0 -translate-x-1 transition group-hover:opacity-100 group-hover:translate-x-0"
                        aria-hidden
                      />
                    </span>
                    <span className="text-[13.5px] leading-snug text-[var(--dc-text-2)]">
                      {text}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul> */}

          {/* <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="border-l-2 border-[var(--dc-accent-border)] pl-3"
              >
                <dt className="sr-only">{s.label}</dt>
                <dd
                  className={`${styles.num} text-[20px] font-semibold tracking-tight text-[var(--dc-text)]`}
                >
                  {s.value}
                </dd>
                <dd className="text-[12.5px] leading-snug text-[var(--dc-text-3)]">
                  {s.label}
                </dd>
              </div>
            ))}
          </dl> */}
        </div>

        {latestUpdates.length > 0 && (
          <div className="lg:pt-4">
            <ChangelogCard entries={latestUpdates} />
          </div>
        )}
      </header>
    </div>
  );
};
