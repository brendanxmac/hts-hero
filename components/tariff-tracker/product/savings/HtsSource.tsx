"use client";

import { ReactNode, useEffect, useState } from "react";
import { ArrowTopRightOnSquareIcon, CheckCircleIcon, ChevronDownIcon, ExclamationTriangleIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { TradePrograms } from "@/public/trade-programs";
import { AllRules } from "@/tariffs/engine-v2/data";
import { findNoteCitations } from "@/tariffs/engine-v2/citations";
import type { GeneralNoteFile, OriginRule, OriginRuleChapter } from "@/libs/general-notes/types";
import { rulesFor } from "@/libs/general-notes/types";
import { CitedNote } from "../../../duty-calculator/referenced-notes/CitedNote";
import { NoteFile } from "../../../duty-calculator/referenced-notes/noteFiles";
import { SavingOption } from "../../opportunities/options";
import { TrackedProduct } from "../../report";

// "What the HTS Says": the exact legal text a saving turns on, beside its question, so the user can
// judge quickly whether their goods might qualify. Nothing is paraphrased:
// - a trade agreement: its product-specific rule of origin for this code (General Notes), with the
//   chapter's own notes, and the agreement's opening terms a tap away
// - another trade program (GN 13 pharmaceuticals, GSP, AGOA…): the note's opening, and for the two
//   with an appendix, a search of the products it names
// - an exemption: each Chapter 99 heading's legal text, and the U.S. notes it cites
// Files load only for the option that's open (libs/general-notes, `npm run notes:general`).

const today = () => new Date().toISOString().slice(0, 10);

// One request per URL, shared
const cache = new Map<string, Promise<unknown>>();
const load = <T,>(url: string): Promise<T | null> => {
  if (!cache.has(url)) cache.set(url, fetch(url).then((r): Promise<unknown> | null => (r.ok ? r.json() : null)).catch((): null => null));
  return cache.get(url) as Promise<T | null>;
};
const useJson = <T,>(url: string | null) => {
  const [state, setState] = useState<{ url: string | null; data: T | null | undefined }>({ url, data: undefined });
  useEffect(() => {
    if (!url) return;
    let live = true;
    load<T>(url).then((data) => live && setState({ url, data }));
    return () => {
      live = false;
    };
  }, [url]);
  return state.url === url ? state.data : undefined;
};

// "2026HTSRev21" → "Revision 21 (2026)"
const revisionName = (rev: string) => {
  const m = rev.match(/^(\d{4})HTS(?:Rev(\d+)|Basic)/);
  return m ? (m[2] ? `Revision ${m[2]} (${m[1]})` : `Basic edition (${m[1]})`) : rev;
};

// The General Note's own PDF, opened in the browser (USITC serves it as a download)
const noteUrl = (note: number) =>
  `https://docs.google.com/gview?url=${encodeURIComponent(`https://hts.usitc.gov/reststop/file?release=currentRelease&filename=General Note ${note}`)}&embedded=true`;

const noteOf = (symbol: string) => {
  const file = TradePrograms.find((p) => p.symbol === symbol)?.fileName;
  const n = file?.match(/General Note (\d+)/)?.[1];
  return n ? +n : null;
};

// The law's words, set apart from ours
const Quote = ({ children }: { children: ReactNode }) => (
  <blockquote className="m-0 whitespace-pre-line border-l-2 border-primary/40 pl-4 text-sm leading-relaxed text-base-content">{children}</blockquote>
);

const SourceLine = ({ children, note }: { children: ReactNode; note?: number }) => (
  <p className={`${tt.caption} m-0 flex flex-wrap items-center gap-x-2 gap-y-1`}>
    <span>{children}</span>
    {note !== undefined && (
      <a className={`${ui.link} inline-flex items-center gap-1 text-xs`} href={noteUrl(note)} target="_blank" rel="noopener noreferrer">
        Open General Note {note}
        <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" aria-hidden />
      </a>
    )}
  </p>
);

const More = ({ label, children }: { label: string; children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-3">
      <button type="button" className="flex items-center gap-1.5 self-start text-sm font-semibold text-base-content/70 hover:text-base-content" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
        {label}
      </button>
      {open && children}
    </div>
  );
};

const Loading = () => <div className={`${ui.skeleton} h-24 w-full`} aria-busy="true" />;

// A note's opening paragraphs, the first few shown
const NoteOpening = ({ note, shown = 2 }: { note: GeneralNoteFile; shown?: number }) => {
  const rest = note.paragraphs.slice(shown);
  return (
    <div className="flex flex-col gap-3">
      <Quote>{note.paragraphs.slice(0, shown).map((p) => p.text).join("\n\n")}</Quote>
      {rest.length > 0 && (
        <More label={`More of General Note ${note.note}`}>
          <Quote>{rest.map((p) => p.text).join("\n\n")}</Quote>
        </More>
      )}
      {note.truncated && <p className={`${tt.caption} m-0`}>The rest is in the full note.</p>}
    </div>
  );
};

const RuleText = ({ rule }: { rule: OriginRule }) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-xs font-semibold text-base-content/70">{/^\d/.test(rule.label) ? `Rule ${rule.label}` : rule.label} · GN p.{rule.page}</span>
    <Quote>{rule.text}</Quote>
  </div>
);

// A trade agreement: the rule of origin for this code
const AgreementRules = ({ note, chapter, htsno }: { note: GeneralNoteFile; chapter: OriginRuleChapter; htsno: string }) => {
  const rules = rulesFor(chapter, htsno);
  const exact = rules.filter((r) => /^(\d|Rule$)/.test(r.label));
  return (
    <div className="flex flex-col gap-4">
      {chapter.warning && (
        <p className={`${ui.notice("warning")} m-0 text-sm`}>
          <ExclamationTriangleIcon className="h-4 w-4 shrink-0 text-warning" aria-hidden />
          USITC marks these rules &ldquo;{chapter.warning}&rdquo;: a rule may name codes that have since changed. Check it with your broker.
        </p>
      )}
      {exact.length ? (
        <>
          <p className="m-0 text-sm text-base-content/80">
            Your goods qualify only if they meet this rule of origin for <span className={`${mono.className} font-semibold`}>{htsno}</span>:
          </p>
          {rules.map((r) => (
            <RuleText key={`${r.label}-${r.page}`} rule={r} />
          ))}
        </>
      ) : (
        <p className="m-0 text-sm text-base-content/80">
          No rule in chapter {chapter.chapter} names <span className={`${mono.className} font-semibold`}>{htsno}</span> exactly. Every rule for the chapter is below.
        </p>
      )}
      {chapter.preamble && (
        <More label={`Chapter ${chapter.chapter}'s own notes`}>
          <Quote>{chapter.preamble}</Quote>
        </More>
      )}
      {!exact.length && (
        <More label={`Every rule for chapter ${chapter.chapter} (${chapter.rules.length})`}>
          {chapter.rules.map((r) => (
            <RuleText key={`${r.label}-${r.page}`} rule={r} />
          ))}
        </More>
      )}
      <More label={`The agreement's general terms (General Note ${note.note})`}>
        <NoteOpening note={note} shown={note.paragraphs.length} />
      </More>
      <SourceLine note={note.note}>
        General Note {note.note}, {note.title}: rules of origin, chapter {chapter.chapter} · {revisionName(chapter.revision)}
      </SourceLine>
    </div>
  );
};

type Match = { name: string; cas?: string; table: number; exact: boolean; via?: string };

// GN 13 and 14: is the product named in the appendix?
const AppendixSearch = ({ note }: { note: number }) => {
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setQuery(q.trim()), 250);
    return () => clearTimeout(t);
  }, [q]);
  const result = useJson<{ revision: string; matches: Match[] }>(query.length >= 3 ? `/api/general-notes/appendix?note=${note}&q=${encodeURIComponent(query)}` : null);
  const what = note === 13 ? "Pharmaceutical Appendix" : "Intermediate Chemicals for Dyes Appendix";
  const exact = result?.matches.filter((m) => m.exact) ?? [];
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-tt-soft p-4">
      <label className="text-sm font-semibold text-base-content" htmlFor={`appendix-${note}`}>
        Is your product in the {what}?
      </label>
      <div className="relative">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/50" aria-hidden />
        <input
          id={`appendix-${note}`}
          className={`${ui.input} w-full pl-9`}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={note === 13 ? "Drug name (INN) or CAS number, like abacavir sulfate" : "Chemical name or CAS number"}
          autoComplete="off"
        />
      </div>
      {query.length >= 3 &&
        (result === undefined ? (
          <p className={`${tt.caption} m-0`}>Searching…</p>
        ) : !result?.matches.length ? (
          <p className="m-0 text-sm text-base-content/70">Not in the appendix. Try its INN or CAS number: a brand name won&apos;t match.</p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
            {exact.length > 0 && (
              <li className="flex items-start gap-2 text-sm font-semibold text-success">
                <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                Listed{exact[0].via ? `, as a ${exact[0].via.toLowerCase()} of ${exact[0].name}` : ""}. Confirm the match with your broker before you claim it.
              </li>
            )}
            {result.matches.map((m) => (
              <li key={m.name} className="flex flex-wrap items-baseline gap-x-2 text-sm text-base-content/80">
                <span className={m.exact ? "font-semibold text-base-content" : ""}>{m.name}</span>
                {m.cas && <span className={`${mono.className} text-xs text-base-content/60`}>CAS {m.cas}</span>}
                <span className="text-xs text-base-content/50">table {m.table}</span>
              </li>
            ))}
          </ul>
        ))}
    </div>
  );
};

const ProgramSource = ({ option, product }: { option: SavingOption; product: TrackedProduct }) => {
  const n = noteOf(option.ref);
  const note = useJson<GeneralNoteFile>(n ? `/data/general-notes/gn-${n}.json` : null);
  const chapterNumber = +product.entry.element.htsno.slice(0, 2);
  const hasRules = !!note?.ruleChapters.includes(chapterNumber);
  const chapter = useJson<OriginRuleChapter>(hasRules && n ? `/data/general-notes/rules/gn-${n}/${chapterNumber}.json` : null);
  if (!n) return null;
  if (note === undefined || (hasRules && chapter === undefined)) return <Loading />;
  if (!note) return <SourceLine note={n}>General Note {n}</SourceLine>;
  if (hasRules && chapter) return <AgreementRules note={note} chapter={chapter} htsno={product.entry.element.htsno} />;
  return (
    <div className="flex flex-col gap-4">
      <NoteOpening note={note} />
      {(n === 13 || n === 14) && <AppendixSearch note={n} />}
      <SourceLine note={n}>
        General Note {n}, {note.title} · GN p.{note.page} · {revisionName(note.revision)}
      </SourceLine>
    </div>
  );
};

// One cited U.S. note passage, fetched alone (some note files are megabytes)
const CitedPassage = ({ citation, htsno }: { citation: ReturnType<typeof findNoteCitations>[number]; htsno: string }) => {
  const file = useJson<NoteFile>(`/api/general-notes/cited?file=${citation.file}&key=${encodeURIComponent(citation.key)}&asOf=${today()}`);
  return <CitedNote citation={citation} file={file} asOf={today()} htsCode={htsno} />;
};

const ExemptionSource = ({ option, product }: { option: SavingOption; product: TrackedProduct }) => {
  const headings = (option.headings ?? []).map((h) => {
    const versions = AllRules.tariffs.filter((t) => t.code === h.code);
    return { ...h, tariff: versions[versions.length - 1] };
  });
  const input = AllRules.inputs.find((i) => i.id === option.ref);
  const citations = findNoteCitations([...headings.map((h) => h.tariff?.description ?? ""), input?.help ?? "", ...(input?.citations ?? [])].join(" "));
  return (
    <div className="flex flex-col gap-4">
      {headings.map((h) => (
        <div key={h.code} className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-base-content/70">
            <span className={mono.className}>{h.code}</span>
            {h.tariff?.name || h.name ? ` · ${h.tariff?.name || h.name}` : ""}
          </span>
          {h.tariff?.description && <Quote>{h.tariff.description}</Quote>}
        </div>
      ))}
      {citations.slice(0, 4).map((c) => (
        <CitedPassage key={c.key} citation={c} htsno={product.entry.element.htsno} />
      ))}
      <SourceLine>Chapter 99, subchapter III{citations.length ? ` and ${citations.map((c) => c.label).join(", ")}` : ""}</SourceLine>
    </div>
  );
};

export const HtsSource = ({ option, product }: { option: SavingOption; product: TrackedProduct }) => {
  if (option.kind === "origin") return null;
  return (
    <section className="flex flex-col gap-3" aria-label="What the HTS says">
      <h3 className={tt.sectionTitle}>What the HTS Says</h3>
      {option.kind === "program" ? <ProgramSource option={option} product={product} /> : <ExemptionSource option={option} product={product} />}
    </section>
  );
};
