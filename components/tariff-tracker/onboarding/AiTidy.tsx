"use client";

import { useState } from "react";
import { ChevronDownIcon, ClipboardDocumentCheckIcon, ClipboardDocumentIcon, SparklesIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";

// For lists too messy to copy two columns from (codes inside descriptions, many tabs, a PDF of
// entry summaries): a prompt for the AI assistant the user already has (Copilot in Excel, Gemini in
// Sheets, ChatGPT, Claude) that turns it into the two columns to paste. One prompt for all of them:
// which assistant anyone has varies by plan, and their buttons move. The AI only copies, never
// classifies: a made-up code would look like a real one, so missing codes stay blank to fix here.

export const AI_PROMPT = `From this spreadsheet or file, make a table with exactly two columns: "HTS Code" and "Country of Origin". One row per product, from every tab or page.

Copy each HTS code exactly as it's written. Don't change, complete or guess any digits, and never look up or suggest a code. If a product has no HTS code or no country, leave that cell blank.

Put the table in a new sheet, or show it as a table in this chat. No other columns, no notes.`;

const WHERE: [string, string][] = [
  ["Excel", "Open Copilot from the Home tab."],
  ["Google Sheets", "Click Ask Gemini at the top right."],
  ["ChatGPT or Claude", "Attach the file or PDF to a new chat."],
];

export const AiTidy = () => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(AI_PROMPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard blocked: the prompt is on screen to copy by hand
    }
    trackEvent(MixpanelEvent.TARIFF_TRACKER_ONBOARDING_HELP_USED, { help: "ai_prompt_copy" });
  };

  return (
    <div className="rounded-2xl border border-base-300 bg-base-100">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => {
          setOpen(!open);
          if (!open) trackEvent(MixpanelEvent.TARIFF_TRACKER_ONBOARDING_HELP_USED, { help: "ai_prompt_open" });
        }}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden>
          <SparklesIcon className="h-4 w-4" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-sm font-semibold text-base-content">Messy sheet, or a PDF? Let AI tidy it.</span>
          <span className="text-xs text-base-content/60">A prompt for Copilot, Gemini, ChatGPT or Claude</span>
        </span>
        <ChevronDownIcon className={`h-5 w-5 shrink-0 text-base-content/50 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && (
        <div className="flex flex-col gap-3.5 border-t border-base-300 px-4 pb-4 pt-3.5">
          <p className="m-0 text-sm leading-relaxed text-base-content/75">
            Codes inside descriptions, products spread over several tabs, entry summaries as PDFs: give this prompt to the AI assistant you already use. It
            pulls out the two columns, then you copy them and paste them here.
          </p>
          <pre className="m-0 whitespace-pre-wrap rounded-xl bg-tt-soft p-3.5 font-sans text-sm leading-relaxed text-base-content/80">{AI_PROMPT}</pre>
          <button type="button" className={`${ui.button({ variant: "secondary", size: "sm" })} self-start`} onClick={copy}>
            {copied ? <ClipboardDocumentCheckIcon className="h-4 w-4 text-success" aria-hidden /> : <ClipboardDocumentIcon className="h-4 w-4" aria-hidden />}
            {copied ? "Copied" : "Copy prompt"}
          </button>
          <dl className="m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-sm">
            {WHERE.map(([tool, how]) => (
              <div key={tool} className="contents">
                <dt className="font-semibold text-base-content">{tool}</dt>
                <dd className="m-0 text-base-content/70">{how}</dd>
              </div>
            ))}
          </dl>
          <p className="m-0 text-xs leading-relaxed text-base-content/60">
            AI can make mistakes: check a few codes against your file. Anything blank or wrong is flagged here for you to fix. Your file goes to that
            assistant, under your plan&apos;s terms, not to us.
          </p>
        </div>
      )}
    </div>
  );
};
