import Link from "next/link";
import {
  ArrowRightIcon,
  BellAlertIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentCheckIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  VideoCameraIcon,
} from "@heroicons/react/20/solid";
import config from "@/config";
import * as mk from "@/components/ui/marketing/styles";
import { formatPrice, MANAGED_TIERS } from "@/components/pricing-calculator/lib/pricing";
import { darkBand, display, glow } from "../lib/theme";

// HTS Hero Managed on the homepage (PRICING.md): the HTS Hero team watches every tariff on the
// importer's imports, audits their entries and briefs them and their broker. HTS Hero isn't a
// licensed customs broker: it never decides codes or files anything; the broker files. A dark
// band of its own so it stands apart from the self-serve tools: the promise, what the team takes
// on, an example of the shared channel, the starting price and the intro call. The full page is the Tracker's Expert Help.

const TAKES_ON = [
  { Icon: ChatBubbleLeftRightIcon, title: "A shared Slack channel", body: "Message the people watching your tariffs. Same-day answers, not a ticket queue." },
  { Icon: VideoCameraIcon, title: "A weekly check-in call", body: "What changed, how it affects your imports, and what to raise with your broker." },
  { Icon: ShieldCheckIcon, title: "Every tariff watched", body: "Every tariff on every import, checked against each new tariff action." },
  { Icon: LightBulbIcon, title: "Briefings for you and your broker", body: "What we find, written up for you and your broker. Your broker decides and files." },
  { Icon: ClipboardDocumentCheckIcon, title: "Every entry audited", body: "Each entry checked against the duty in force on its date, with anything that looks off flagged for your broker." },
  { Icon: BellAlertIcon, title: "Every tariff change, briefed", body: "When a new tariff lands, you hear from us first, with how it affects each import." },
];

const Message = ({ who, team, children }: { who: string; team?: boolean; children: string }) => (
  <div className="flex gap-3">
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${team ? "bg-primary text-primary-content" : "bg-base-content/10 text-base-content"}`}
      aria-hidden
    >
      {team ? "HH" : "You"}
    </span>
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="text-xs font-bold text-base-content">{who}</span>
      <p className="m-0 text-sm leading-relaxed text-base-content/80">{children}</p>
    </div>
  </div>
);

export const ManagedSection = () => {
  const from = MANAGED_TIERS[0];
  return (
    <section id="managed" className={`relative overflow-hidden ${mk.band} ${darkBand} scroll-mt-20`} aria-labelledby="managed-title">
      <div aria-hidden className={glow} />
      <div className={`${mk.container} relative`}>
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div>
            <p className={mk.eyebrow}>HTS Hero Managed</p>
            <h2 id="managed-title" className={`${mk.h2} mt-4`}>
              Your Dedicated Tariff Team, <span className={mk.accent}>Without the Headcount.</span>
            </h2>
            <p className={`${mk.lead} mt-5`}>
              We watch every tariff on your imports, audit every entry, and brief your team on what we find, every week.
              Plus, get direct access to tariff experts for any questions that pop up.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
              <a
                href={config.bookCallUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-14 items-center gap-2 rounded-full bg-primary px-8 text-lg font-semibold text-primary-content transition-colors hover:bg-primary/90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                Book an intro call
                <ArrowRightIcon className="h-5 w-5" aria-hidden />
              </a>
              <span className="text-base text-base-content/70">
                From <strong className={`${display} text-2xl font-semibold text-base-content`}>{formatPrice(from.price)}</strong>/mo · up to{" "}
                {from.maxPairs} imports
              </span>
            </div>
          </div>

          {/* What working together looks like: the shared channel, as an example */}
          <div className="rounded-3xl border border-base-content/10 bg-base-100/60 p-6 shadow-2xl backdrop-blur-xs" aria-label="An example of the shared Slack channel">
            <div className="mb-5 flex items-center justify-between border-b border-base-content/10 pb-4">
              <span className="text-sm font-bold text-base-content"># acme-tariffs</span>
              <span className="text-xs text-base-content/50">Example</span>
            </div>
            <div className="flex flex-col gap-5">
              <Message who="HTS Hero · Sam" team>
                Quick heads up, the new Section 232 action covers 14 of your imports from Oct 1. Average rate goes from 12.5% to 37.5% (+25%). Briefing attached for you and your broker.
              </Message>
              <Message who="Dana, Acme">Can we move the steel brackets to the Mexico supplier?</Message>
              <Message who="HTS Hero · Sam" team>
                Worth asking your broker. If they qualify for USMCA, they could enter at 0%. We&apos;ll go through it on Thursday&apos;s call.
              </Message>
            </div>
          </div>
        </div>

        <ul className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TAKES_ON.map(({ Icon, title, body }) => (
            <li key={title} className="flex gap-4 rounded-2xl border border-base-content/10 bg-base-100/40 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary" aria-hidden>
                <Icon className="h-5 w-5" />
              </span>
              <span className="flex flex-col gap-1">
                <span className="font-semibold text-base-content">{title}</span>
                <span className="text-sm leading-relaxed text-base-content/70">{body}</span>
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-center">
          <Link href="/tariff-tracker?tab=expert-help" className="font-semibold text-primary underline-offset-4 hover:underline">
            See everything HTS Hero Managed includes
          </Link>
        </p>
      </div>
    </section>
  );
};
