"use client";

import { useState } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BellIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  EnvelopeIcon,
  PencilSquareIcon,
  TableCellsIcon,
} from "@heroicons/react/20/solid";
import * as tt from "@/components/ui/styles/tracker";
import * as ui from "@/components/ui/styles";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { delay, StepHeading } from "./parts";

// For anyone without their list to hand: where it usually is, a ready-made email for their
// customs broker (who has every entry), starting with the few they know, a reminder tomorrow, and,
// last and quietest, an example list to look around with.

export const BROKER_SUBJECT = "HTS codes and countries of origin for our imports";
export const BROKER_MESSAGE = `Hi,

Could you send me a list of the HTS codes and countries of origin on our entries from the last 12 months? A spreadsheet export is perfect, one row per HTS code and country.

Thanks!`;

const PLACES = [
  "Your product, parts or SKU master spreadsheet",
  "Purchase orders and commercial invoices from suppliers",
  "Your ERP or accounting system's item list (NetSuite, QuickBooks, SAP)",
  "Entry summaries (CBP Form 7501) from your broker",
];

const Card = ({
  Icon,
  title,
  children,
  wait,
  tone = "primary",
}: {
  Icon: typeof TableCellsIcon;
  title: string;
  children: React.ReactNode;
  wait: number;
  tone?: "primary" | "success" | "warning";
}) => (
  <div className={`${tt.panel} tt-ob-rise flex flex-col gap-3 p-5`} style={delay(wait)}>
    <div className="flex items-center gap-3">
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone === "success" ? "bg-success/10 text-success" : tone === "warning" ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"}`}
        aria-hidden
      >
        <Icon className="h-[1.125rem] w-[1.125rem]" />
      </span>
      <span className={tt.title}>{title}</span>
    </div>
    {children}
  </div>
);

export const HandyStep = ({ onBack, onFew, onRemind }: { onBack: () => void; onFew: () => void; onRemind: () => void }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(BROKER_MESSAGE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard blocked: the message is on screen to copy by hand
    }
    trackEvent(MixpanelEvent.TARIFF_TRACKER_ONBOARDING_HELP_USED, {
      help: "broker_copy",
    });
  };
  const mailto = `mailto:?subject=${encodeURIComponent(BROKER_SUBJECT)}&body=${encodeURIComponent(BROKER_MESSAGE)}`;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-base-content/60 hover:text-base-content"
      >
        <ArrowLeftIcon className="h-4 w-4" aria-hidden />
        Back
      </button>
      <StepHeading
        eyebrow="No list to hand?"
        tone="warning"
        title="Here's how to get it in a few minutes."
        lead="Almost every importer already has this list somewhere. It's usually one of these places, or one email to your customs broker away."
        size="md"
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card Icon={TableCellsIcon} title="Check where it usually lives" wait={150}>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {PLACES.map((p) => (
              <li key={p} className="flex gap-2 text-sm text-base-content/80">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                {p}
              </li>
            ))}
          </ul>
          <p className="m-0 text-xs leading-relaxed text-base-content/60">
            Look for columns called &ldquo;HTS&rdquo;, &ldquo;HTSUS&rdquo;, &ldquo;tariff code&rdquo; or &ldquo;HS code&rdquo;, and &ldquo;origin&rdquo; or
            &ldquo;COO&rdquo;. A 6-digit HS code isn&apos;t enough: the US code has 8 or 10.
          </p>
        </Card>

        <Card Icon={EnvelopeIcon} title="Ask your customs broker" wait={220} tone="success">
          <p className="m-0 text-sm text-base-content/80">They file every one of your entries, so they have the list. Send them this:</p>
          <pre className="m-0 whitespace-pre-wrap rounded-xl bg-tt-soft p-3.5 font-sans text-sm leading-relaxed text-base-content/80">{BROKER_MESSAGE}</pre>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={ui.button({ variant: "secondary", size: "sm" })} onClick={copy}>
              {copied ? <ClipboardDocumentCheckIcon className="h-4 w-4 text-success" aria-hidden /> : <ClipboardDocumentIcon className="h-4 w-4" aria-hidden />}
              {copied ? "Copied" : "Copy message"}
            </button>
            <a
              href={mailto}
              className={ui.button({ variant: "secondary", size: "sm" })}
              onClick={() =>
                trackEvent(MixpanelEvent.TARIFF_TRACKER_ONBOARDING_HELP_USED, {
                  help: "broker_email",
                })
              }
            >
              <EnvelopeIcon className="h-4 w-4" aria-hidden />
              Open in my email
            </a>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={onFew}
          className={`${tt.panel} tt-ob-rise group flex items-center gap-4 p-5 text-left transition-colors hover:border-primary/50`}
          style={delay(300)}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary" aria-hidden>
            <PencilSquareIcon className="h-5 w-5" />
          </span>
          <span className="flex flex-1 flex-col gap-0.5">
            <span className="font-semibold text-base-content">Start with the few you know</span>
            <span className="text-sm text-base-content/70">Your best sellers, off the top of your head. Add the rest later.</span>
          </span>
          <ArrowRightIcon className="h-5 w-5 text-base-content/40 group-hover:text-primary" aria-hidden />
        </button>
        <button
          type="button"
          onClick={onRemind}
          className={`${tt.panel} tt-ob-rise group flex items-center gap-4 p-5 text-left transition-colors hover:border-primary/50`}
          style={delay(360)}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/10 text-warning" aria-hidden>
            <BellIcon className="h-5 w-5" />
          </span>
          <span className="flex flex-1 flex-col gap-0.5">
            <span className="font-semibold text-base-content">Remind me tomorrow</span>
            <span className="text-sm text-base-content/70">We&apos;ll email you these steps, so it&apos;s waiting when you have the list.</span>
          </span>
          <ArrowRightIcon className="h-5 w-5 text-base-content/40 group-hover:text-primary" aria-hidden />
        </button>
      </div>
    </div>
  );
};
