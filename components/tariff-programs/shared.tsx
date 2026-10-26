import Link from "next/link";
import type { ReactNode } from "react";
import type { OfficialSource } from "@/libs/official-sources";
import { mono } from "@/components/ui/font";
import * as tt from "@/components/ui/styles/tracker";

// Pieces the Chapter 99 pages and the /tariffs program pages share, in the Tariff Tracker's look

const chip = `${mono.className} inline-block rounded-md bg-tt-soft px-1.5 py-0.5 text-xs font-medium text-base-content/80`;

// An HTS code or Chapter 99 heading as a small chip, linked to its page (`href`), or plain when it
// resolves to no line of the current HTS (null)
export const CodeChip = ({ code, href = `/hts/${code}` }: { code: string; href?: string | null }) =>
  href ? (
    <Link href={href} className={`${chip} transition-colors hover:bg-primary/10 hover:text-primary`}>
      {code}
    </Link>
  ) : (
    <span className={chip}>{code}</span>
  );

export const CodeChips = ({ codes, hrefs }: { codes: string[]; hrefs?: Record<string, string | null> }) => (
  <span className="flex flex-wrap gap-1.5">
    {codes.map((code) => (
      <CodeChip key={code} code={code} href={hrefs ? hrefs[code] : undefined} />
    ))}
  </span>
);

// The documents behind a row or a fact, linked to the publisher
export const SourceLinks = ({ sources, prefix = "Source: " }: { sources: OfficialSource[]; prefix?: string }) =>
  sources.length > 0 ? (
    <span className="block text-xs leading-snug text-base-content/60">
      {prefix}
      {sources.map((source, i) => (
        <span key={source.url ?? source.label}>
          {i > 0 && "; "}
          {source.url ? (
            <a href={source.url} target="_blank" rel="noopener noreferrer" className="underline decoration-base-content/20 underline-offset-2 hover:text-primary">
              {source.label}
            </a>
          ) : (
            source.label
          )}
        </span>
      ))}
    </span>
  ) : null;

// Label and value pairs in a panel: the facts at a glance. `inset` drops the panel (for a band
// inside another card) and goes to three columns on wide screens.
export const FactGrid = ({ facts, inset = false }: { facts: { label: string; value: ReactNode }[]; inset?: boolean }) => (
  <dl className={`${inset ? "" : tt.panel} m-0 grid divide-y divide-base-300 sm:grid-cols-2 sm:divide-y-0 ${inset ? "flex-1 lg:grid-cols-3" : ""}`}>
    {facts.map((fact, i) => (
      <div
        key={fact.label}
        className={`flex flex-col gap-1 ${inset ? "px-6" : "px-5"} py-4 border-base-300 ${i >= 2 ? "sm:border-t" : ""} ${i % 2 === 1 ? "sm:border-l" : ""} ${
          inset ? `${i >= 3 ? "lg:border-t" : "lg:border-t-0"} ${i % 3 === 0 ? "lg:border-l-0" : "lg:border-l"}` : ""
        }`}
      >
        <dt className={tt.eyebrow()}>{fact.label}</dt>
        <dd className="m-0 text-sm font-medium leading-snug text-base-content">{fact.value}</dd>
      </div>
    ))}
  </dl>
);

// "In force", "Ended", "Scheduled", as a tinted pill
export const StatusPill = ({ status }: { status: "in-force" | "ended" | "scheduled" }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
      status === "in-force" ? "bg-success/15 text-success" : status === "ended" ? "bg-base-300 text-base-content/70" : "bg-warning/15 text-warning"
    }`}
  >
    {status === "in-force" ? "In force" : status === "ended" ? "Ended" : "Scheduled"}
  </span>
);
