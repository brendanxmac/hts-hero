"use client";

import { ReactNode, useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import {
  ArrowRightIcon,
  ArrowUpTrayIcon,
  BuildingOffice2Icon,
  CheckIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  ServerStackIcon,
  TableCellsIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import config from "@/config";
import { mono, trackerSans } from "@/components/ui/font";
import * as tt from "@/components/ui/styles/tracker";
import * as ui from "@/components/ui/styles";
import { THEME } from "@/components/ui/theme";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { BROKER_MESSAGE, BROKER_SUBJECT } from "./HandyStep";
import { TakeoverStep } from "./takeoverStore";

// "Where do I find my HTS codes and countries of origin?": a guide to every place importers keep
// them, most likely first, with what to look for in each and how to get it into the Tracker. The
// country of origin is always as declared on their entries: we point to where it's written, and
// never decide it for them.

// A source of the list: where it is, what to look for, and how to bring it in
const Source = ({ n, Icon, title, children }: { n: number; Icon: typeof TableCellsIcon; title: string; children: ReactNode }) => (
  <section className="flex gap-4">
    <div className="flex flex-col items-center gap-2">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary" aria-hidden>
        <Icon className="h-5 w-5" />
      </span>
      <span className="w-px flex-1 bg-base-300" aria-hidden />
    </div>
    <div className="flex min-w-0 flex-1 flex-col gap-2.5 pb-7">
      <h3 className={`${tt.display} m-0 text-base font-semibold text-base-content`}>
        <span className="text-base-content/40">{n}.</span> {title}
      </h3>
      {children}
    </div>
  </section>
);

const P = ({ children }: { children: ReactNode }) => <p className="m-0 text-sm leading-relaxed text-base-content/80">{children}</p>;

const Tags = ({ label, tags }: { label: string; tags: string[] }) => (
  <div className="flex flex-wrap items-center gap-1.5 text-xs">
    <span className="font-semibold text-base-content/70">{label}</span>
    {tags.map((t) => (
      <span key={t} className={`${mono.className} rounded-md bg-tt-soft px-1.5 py-0.5 font-semibold text-base-content`}>
        {t}
      </span>
    ))}
  </div>
);

// The parts of a CBP Form 7501 that matter here: box 10 at the top, and each line's column 29
const Form7501 = () => (
  <figure
    className="m-0 overflow-hidden rounded-xl border border-base-300 bg-base-100 text-[0.7rem]"
    aria-label="Where the HTS code and country of origin are on a CBP Form 7501"
  >
    <div className="flex items-center justify-between border-b border-base-300 bg-tt-soft px-3 py-1.5 font-semibold text-base-content/60">
      <span>CBP Form 7501 · Entry Summary</span>
      <span>Page 1</span>
    </div>
    <div className="grid grid-cols-4 border-b border-base-300">
      {["7. Entry Date", "8. Importing Carrier", "9. Mode of Transport", "10. Country of Origin"].map((label, i) => (
        <div key={label} className={`border-r border-base-300 px-2.5 py-2 last:border-r-0 ${i === 3 ? "bg-primary/10" : ""}`}>
          <div className={i === 3 ? "font-bold text-primary" : "text-base-content/50"}>{label}</div>
          <div className={`${mono.className} mt-0.5 font-semibold ${i === 3 ? "text-base-content" : "text-base-content/40"}`}>
            {["10/02/26", "MAERSK LINE", "11", "VN"][i]}
          </div>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-[3rem_minmax(0,1fr)_8rem_5rem] border-b border-base-300 text-base-content/50">
      <div className="border-r border-base-300 px-2 py-1.5">27. Line</div>
      <div className="border-r border-base-300 px-2 py-1.5">28. Description</div>
      <div className="border-r border-base-300 bg-primary/10 px-2 py-1.5 font-bold text-primary">29. HTSUS No.</div>
      <div className="px-2 py-1.5">34. Duty</div>
    </div>
    {[
      ["001", "Cotton T-shirts", "6109.10.0012"],
      ["002", "Cotton sweaters", "6110.20.2079"],
    ].map(([line, desc, code]) => (
      <div key={line} className="grid grid-cols-[3rem_minmax(0,1fr)_8rem_5rem] border-b border-base-300 last:border-b-0">
        <div className={`${mono.className} border-r border-base-300 px-2 py-1.5 text-base-content/40`}>{line}</div>
        <div className="truncate border-r border-base-300 px-2 py-1.5 text-base-content/40">{desc}</div>
        <div className={`${mono.className} border-r border-base-300 bg-primary/5 px-2 py-1.5 font-semibold text-base-content`}>{code}</div>
        <div className="px-2 py-1.5 text-base-content/30">…</div>
      </div>
    ))}
  </figure>
);

export const FindGuide = ({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (step: TakeoverStep) => void }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(BROKER_MESSAGE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard blocked: the message is on screen to copy by hand
    }
    trackEvent(MixpanelEvent.TARIFF_TRACKER_ONBOARDING_HELP_USED, { help: "guide_broker_copy" });
  };
  const go = (step: TakeoverStep) => {
    onClose();
    onPick(step);
    trackEvent(MixpanelEvent.TARIFF_TRACKER_ONBOARDING_HELP_USED, { help: `guide_${step}` });
  };
  const mailto = `mailto:?subject=${encodeURIComponent(BROKER_SUBJECT)}&body=${encodeURIComponent(BROKER_MESSAGE)}`;
  const support = `mailto:${config.resend.supportEmail}?subject=${encodeURIComponent("Help adding my imports")}`;

  return (
    // Over the takeover (z-70), which it opens from
    <Dialog open={open} onClose={onClose} className="relative z-[80]">
      <div className="fixed inset-0 bg-black/50" aria-hidden />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        {/* It portals out of the Tracker, so it carries the Tracker's look itself (DESIGN_SYSTEM §15) */}
        <Dialog.Panel
          className={`${THEME} hts-tracker ${trackerSans.className} ${tt.panel} flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden shadow-2xl`}
        >
          <div className="flex items-start justify-between gap-4 border-b border-base-300 px-7 pb-5 pt-6">
            <div className="flex flex-col gap-1.5">
              <span className={tt.eyebrow("primary")}>Finding your imports</span>
              <Dialog.Title className={`${tt.display} m-0 text-2xl font-semibold leading-tight text-base-content`}>
                Where to find your HTS codes and countries of origin
              </Dialog.Title>
              <p className="m-0 text-sm text-base-content/70">
                Most importers already have them in one of these places. Start at the top: you only need one that covers your products.
              </p>
            </div>
            <button type="button" onClick={onClose} className="rounded-full p-1.5 text-base-content/50 hover:bg-tt-soft hover:text-base-content">
              <XMarkIcon className="h-5 w-5" aria-hidden />
              <span className="sr-only">Close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-7 pt-6">
            <Source n={1} Icon={TableCellsIcon} title="Your own product spreadsheets">
              <P>
                A product, parts or SKU list, a costing sheet, a purchase order tracker: if your team classifies products, the codes are usually kept next to
                them. Search the file (<span className={`${mono.className} font-semibold`}>Ctrl F</span> or{" "}
                <span className={`${mono.className} font-semibold`}>⌘ F</span>) for &ldquo;HTS&rdquo; or &ldquo;origin&rdquo;.
              </P>
              <Tags label="Code columns:" tags={["HTS", "HTSUS", "HTS Code", "Tariff Code", "Tariff No.", "Harmonized Code"]} />
              <Tags label="Origin columns:" tags={["Country of Origin", "COO", "Origin", "Made In"]} />
              <P>Found it? Upload the file as it is, or copy just those two columns and paste them. We find the columns, and skip everything else.</P>
            </Source>

            <Source n={2} Icon={DocumentTextIcon} title="Your entry summaries (CBP Form 7501)">
              <P>
                Your customs broker files one for every shipment and usually sends you a copy. Each line of the entry has its HTS code in{" "}
                <strong className="text-base-content">column 29</strong>, and the country of origin is in <strong className="text-base-content">box 10</strong>{" "}
                at the top.
              </P>
              <Form7501 />
              <P>
                If box 10 says <span className={`${mono.className} font-semibold`}>MULTI</span>, the entry covers more than one origin and each line shows its
                own, under its line number in column 27. A year of entry summaries covers almost everything you import.
              </P>
              <P>Got them as PDFs? An AI assistant can pull the codes and countries out for you: there&apos;s a prompt for it on the Paste a list page.</P>
            </Source>

            <Source n={3} Icon={EnvelopeIcon} title="Ask your customs broker or team for a list">
              <P>
                The quickest route if you don&apos;t keep a list yourself. Brokers can export every line they&apos;ve filed for you, with its HTS code and
                country of origin, usually the same day. Send them this:
              </P>
              <pre className="m-0 whitespace-pre-wrap rounded-xl bg-tt-soft p-3.5 font-sans text-sm leading-relaxed text-base-content/80">{BROKER_MESSAGE}</pre>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={ui.button({ variant: "secondary", size: "sm" })} onClick={copy}>
                  {copied ? (
                    <ClipboardDocumentCheckIcon className="h-4 w-4 text-success" aria-hidden />
                  ) : (
                    <ClipboardDocumentIcon className="h-4 w-4" aria-hidden />
                  )}
                  {copied ? "Copied" : "Copy message"}
                </button>
                <a
                  href={mailto}
                  className={ui.button({ variant: "secondary", size: "sm" })}
                  onClick={() => trackEvent(MixpanelEvent.TARIFF_TRACKER_ONBOARDING_HELP_USED, { help: "guide_broker_email" })}
                >
                  <EnvelopeIcon className="h-4 w-4" aria-hidden />
                  Open in my email
                </a>
              </div>
              <P>Their spreadsheet can go straight in, as it is.</P>
            </Source>

            <Source n={4} Icon={ClipboardDocumentListIcon} title="Commercial invoices and supplier paperwork">
              <P>
                Many commercial invoices list an HTS code and a country of origin for each item, and so do packing lists and supplier spec sheets. Your
                suppliers can often send their list for the products they sell you. Check that the codes have 8 or 10 digits: suppliers sometimes give only the
                6-digit HS code, which isn&apos;t enough.
              </P>
            </Source>

            <Source n={5} Icon={ServerStackIcon} title="Your ERP, inventory or accounting system">
              <P>
                Systems like NetSuite, SAP, Acumatica or QuickBooks often keep an HTS code and a country of origin on each item record, sometimes as a custom
                field. Export your item list to Excel or CSV and upload it.
              </P>
            </Source>

            <Source n={6} Icon={BuildingOffice2Icon} title="Still stuck? Send it to us">
              <P>
                Email us whatever you have (a spreadsheet, invoices, entry summaries) at{" "}
                <a href={support} className={ui.link}>
                  {config.resend.supportEmail}
                </a>{" "}
                and we&apos;ll help you get your imports in.
              </P>
            </Source>

            {/* What makes a list ready to add */}
            <div className="mb-6 rounded-2xl border border-success/30 bg-success/5 p-5">
              <h3 className="m-0 text-sm font-semibold text-base-content">Before you add them, check that:</h3>
              <ul className="m-0 mt-2.5 flex list-none flex-col gap-1.5 p-0">
                {[
                  "Each code has 8 or 10 digits (dots are fine; 6-digit HS codes won't work)",
                  "Each code has the country of origin declared on your entries next to it",
                  "Repeats and extra columns are fine: each code and country is counted once, the rest is skipped",
                ].map((c) => (
                  <li key={c} className="flex items-start gap-2 text-sm text-base-content/80">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={`${ui.cardFooter} flex flex-wrap items-center justify-between gap-3 px-7`}>
            <span className="text-sm text-base-content/60">Got your list?</span>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={ui.button({ variant: "secondary" })} onClick={() => go("paste")}>
                <ClipboardDocumentListIcon className="h-4 w-4" aria-hidden />
                Paste a list
              </button>
              <button type="button" className={ui.button({ variant: "primary" })} onClick={() => go("file")}>
                <ArrowUpTrayIcon className="h-4 w-4" aria-hidden />
                Upload a spreadsheet
                <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
