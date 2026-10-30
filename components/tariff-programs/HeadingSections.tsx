import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { countriesPhrase, longDate, type HeadingProfile } from "@/libs/tariff-programs/heading";
import { hubPath } from "@/libs/tariff-programs/hubs";
import { AllRules } from "@/tariffs/engine-v2/data";
import type { CodeInfo } from "@/libs/tariff-programs/codeLinks";
import { CardSection } from "@/components/hts-code-page/CardSection";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { CodeChips, FactGrid, SourceLinks, StatusPill } from "./shared";
import { CodeList } from "./CodeList";
import { CoveredCodesSearch } from "./CoveredCodesSearch";

// A modeled Chapter 99 heading on its /hts/9903.xx.xx page: the facts at a glance in the hero,
// then the codes it covers, the headings that override it, its history, refunds and the program's
// other headings. Everything comes from the engine's records (libs/tariff-programs/heading.ts).

// How many covered codes the heading's page lists; the program page has them all
export const COVERED_CODES_SHOWN = 150;
// A Chapter 99 heading's short name ("Section 301 China: List 3"), from its latest record, for the
// headings that take precedence; falls back to the HTS line's name for a heading we don't model
const headingName = (code: string, info?: CodeInfo) => AllRules.tariffs.findLast((t) => t.code === code)?.name ?? info?.name;

// Up to this many covered codes list in full, without a search box or a scroll box
const COVERED_CODES_UNBOXED = 30;


const statusText = (p: HeadingProfile) =>
  p.status === "in-force"
    ? p.endsOn
      ? `Until ${longDate(p.endsOn)}`
      : p.startedOn
        ? `Since ${longDate(p.startedOn)}`
        : ""
    : p.status === "ended"
      ? `Ended ${longDate(p.endsOn!)}`
      : `Starts ${longDate(p.startedOn ?? p.asOf)}`;

// `inset`: as a band inside the hero card, not a panel of its own
export function HeadingFacts({ profile: p, inset = false }: { profile: HeadingProfile; inset?: boolean }) {
  const facts = [
    {
      label: "Program",
      value: p.hub ? (
        <Link href={hubPath(p.hub)} className={ui.link}>
          {p.program.name}
        </Link>
      ) : (
        p.program.name
      ),
    },
    { label: "Rate", value: <>{p.rate}{p.basis ? <span className="font-normal text-base-content/70"> {p.basis}</span> : null}</> },
    {
      label: "Status",
      value: (
        <span className="flex flex-wrap items-center gap-2">
          <StatusPill status={p.status} />
          <span>{statusText(p)}</span>
        </span>
      ),
    },
    { label: "Applies to", value: countriesPhrase(p).replace(/^goods from /, "Goods from ") },
    {
      label: "Covers",
      value: p.coverage.all
        ? "Every HTS code, except where another heading takes precedence"
        : `${p.coverage.codes.length.toLocaleString("en-US")} listed HTS code${p.coverage.codes.length === 1 ? "" : "s"}`,
    },
    {
      label: "Legal source",
      value: p.sources.length > 0 ? <SourceLinks sources={p.sources} prefix="" /> : <span className="font-normal text-base-content/70">U.S. notes to Chapter 99, subchapter III</span>,
    },
  ];
  return (
    <div className={`flex flex-col ${inset ? "flex-1" : "gap-3"}`}>
      <FactGrid facts={facts} inset={inset} />
      {p.conditional && (
        <p className={`${ui.bodySm} m-0 ${inset ? "border-t border-base-300 px-6 py-3" : ""}`}>
          This heading applies only when the importer confirms a fact about the goods or claims it on the entry. Check the legal text below.
        </p>
      )}
    </div>
  );
}

export function HeadingDetails({
  profile: p,
  codeInfo,
}: {
  profile: HeadingProfile;
  // Links and names of the covered and excluded codes, by dotted code
  codeInfo: Record<string, CodeInfo>;
}) {
  const shown = p.coverage.codes.slice(0, COVERED_CODES_SHOWN);
  const more = p.coverage.codes.length - shown.length;
  const list = <CodeList items={shown.map((code) => ({ code, ...codeInfo[code], href: codeInfo[code]?.href ?? null }))} />;
  // A long list scrolls in its own box, every row still in the page
  const coveredList = shown.length > COVERED_CODES_UNBOXED ? <div className="max-h-[36rem] overflow-y-auto">{list}</div> : list;
  return (
    <>
      {p.coverage.codes.length > 0 && (
        <CardSection
          id="covered-codes"
          kicker="Coverage"
          title={`HTS Codes Covered by ${p.code}`}
          lead={<>
            {p.status === "ended" ? "The" : "Every"} HTS code {p.code} {p.status === "ended" ? "listed when it ended" : "lists"}, from the U.S. notes to Chapter 99. A code
            covers every line under it. Whether a product is in scope also depends on the note&apos;s written description.
          </>}
        >
          {p.coverage.codes.length > COVERED_CODES_UNBOXED ? (
            <CoveredCodesSearch heading={p.code} total={p.coverage.codes.length}>
              {coveredList}
            </CoveredCodesSearch>
          ) : (
            coveredList
          )}
          {p.hub && more > 0 && (
            <div className="flex flex-wrap items-center gap-3 border-t border-base-300 bg-tt-soft px-6 py-4">
              <Link href={`${hubPath(p.hub)}#codes`} className={ui.button({ variant: "secondary" })}>
                See all {p.coverage.codes.length.toLocaleString("en-US")} codes
                <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          )}
          {p.coverage.excluded.length > 0 && (
            <div className="flex flex-col gap-2 border-t border-base-300 px-6 py-5">
              <h3 className={`${tt.title} m-0`}>Codes Excluded</h3>
              <p className={`${ui.bodySm} m-0`}>{p.code} doesn&apos;t apply to these codes, even where a broader code above lists them.</p>
              <CodeChips codes={p.coverage.excluded} hrefs={Object.fromEntries(p.coverage.excluded.map((c) => [c, codeInfo[c]?.href ?? null]))} />
            </div>
          )}
        </CardSection>
      )}

      {p.exceptions.length > 0 && (
        <CardSection
          id="exceptions"
          kicker="Precedence"
          title={`Headings That Take Precedence Over ${p.code}`}
          lead={<>{p.code} doesn&apos;t apply to goods entered under any of these headings. They carry their own rate or exemption.</>}
        >
          <CodeList items={p.exceptions.map((code) => ({ code, name: headingName(code, codeInfo[code]), href: codeInfo[code]?.href ?? null }))} />
        </CardSection>
      )}

      {p.refund && (
        <CardSection id="refunds" kicker="Refunds" title={`Refunds of Duty Paid Under ${p.code}`} padded lead={p.refund.text}>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/duty-audits" className={ui.button({ variant: "primary" })}>
              Check your past entries
              <ArrowRightIcon className="h-4 w-4" aria-hidden />
            </Link>
            {p.refund.links.map((link) => (
              <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className={ui.link}>
                {link.label}
              </a>
            ))}
          </div>
        </CardSection>
      )}

      {p.history.length > 0 && (
        <CardSection
          id="history"
          kicker="History"
          title={`${p.code} Over Time`}
          lead={<>Each version of {p.code} in our tariff data, with the dates it applied to goods entered and the documents behind it.</>}
        >
          <ol className="m-0 list-none divide-y divide-base-300 p-0">
            {[...p.history].reverse().map((v, i) => (
              <li key={i} className="flex flex-col gap-1 px-6 py-3.5 sm:flex-row sm:items-baseline sm:gap-6">
                <span className="w-64 shrink-0 text-sm font-medium tabular-nums text-base-content">
                  {v.from ? longDate(v.from) : "Before tracking began"} → {v.to ? longDate(v.to) : "now"}
                </span>
                <span className="w-56 shrink-0 text-sm font-semibold text-base-content">{v.rate}</span>
                <SourceLinks sources={v.sources} prefix="" />
              </li>
            ))}
          </ol>
        </CardSection>
      )}

      <CardSection
        id="legal-text"
        kicker="Legal text"
        title={`The Text of Heading ${p.code}`}
        lead={<>As it reads in the Harmonized Tariff Schedule{p.status === "ended" ? " for the last version in force" : ""}.</>}
      >
        <blockquote className="m-0 border-l-4 border-primary/30 bg-tt-soft px-6 py-5 text-sm leading-relaxed text-base-content/80">{p.legalText}</blockquote>
      </CardSection>

      {p.siblings.length > 0 && (
        <CardSection
          id="program-headings"
          kicker="Same program"
          title={`Other ${p.program.name} Headings`}
          lead={p.hub ? (
              <>
                All of them, with every code they cover, are on the{" "}
                <Link href={hubPath(p.hub)} className={ui.link}>
                  {p.hub.title}
                </Link>{" "}
                page.
              </>
            ) : undefined}
        >
          <CodeList items={p.siblings.slice(0, 24).map((sib) => ({ code: sib.code, name: sib.name, href: codeInfo[sib.code]?.href ?? null }))} />
        </CardSection>
      )}
    </>
  );
}

// The page's questions for a modeled heading, shown in its FAQ and FAQPage schema
export function headingFaqs(p: HeadingProfile, answer: string): [string, string][] {
  const past = p.status === "ended";
  const status =
    p.status === "in-force"
      ? `Yes. ${p.code} is in force${p.startedOn ? `, and has applied to goods entered since ${longDate(p.startedOn)}` : ""}${p.endsOn ? `. It is scheduled to end for goods entered on or after ${longDate(p.endsOn)}` : ""}.`
      : p.status === "ended"
        ? `No. ${p.code} ended for goods entered on or after ${longDate(p.endsOn!)}. It still applies to entries made while it was in force.`
        : `Not yet. ${p.code} takes effect for goods entered on or after ${longDate(p.startedOn ?? p.asOf)}.`;
  return [
    [`What is HTS ${p.code}?`, answer],
    [`Is ${p.code} still in effect?`, status],
    [
      `What rate does ${p.code} add?`,
      p.rateKind === "free" || p.ratePct === 0
        ? `None. ${p.code} is an exemption or reporting heading: goods entered under it pay no ${p.program.name} duty, but the regular duty and any other Chapter 99 duties still apply.`
        : p.rateKind === "topUpTo"
          ? `${p.code} ${past ? "brought" : "brings"} the total duty up to ${p.ratePct}%, including the regular (base) rate, so goods with a base rate of ${p.ratePct}% or more ${past ? "paid" : "pay"} nothing extra under it.`
          : `${p.code} ${past ? "added" : "adds"} ${p.rate.replace(/^\+/, "")}${p.basis ? ` ${p.basis}` : ""} on top of the regular duty and any other Chapter 99 duties that ${past ? "applied" : "apply"}.`,
    ],
    [
      `Which goods does ${p.code} apply to?`,
      `${countriesPhrase(p).replace(/^goods/, "Goods")}${p.coverage.all ? ", in any HTS code" : `, in the ${p.coverage.codes.length.toLocaleString("en-US")} HTS codes it lists`}${p.exceptions.length > 0 ? `, unless another heading takes precedence (${p.exceptions.slice(0, 3).join(", ")}${p.exceptions.length > 3 ? " and others" : ""})` : ""}.`,
    ],
    ...(p.refund ? [[`Can I get a refund of duty paid under ${p.code}?`, p.refund.text] as [string, string]] : []),
  ];
}
