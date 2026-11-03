import { ComponentType, ReactNode } from "react";
import { SectionSlug } from "../../sections";
import { TourStepId } from "./tourStore";
import { AdcvdVisual, AlertsVisual, AuditsVisual, ImportsVisual, ManageVisual, SavingsVisual, WelcomeVisual } from "./visuals";

// The feature tour's steps (FeatureTour), in order. Each one: what it's for, how to do it in a few
// short steps (Duty Guard's own labels in bold), where "Take me there" goes, and its demo.

// The video walkthroughs, one per step. Until a step has one, the tour shows a "Video walkthrough ·
// Coming soon" placeholder. Add a link and its length to switch it on: a YouTube, Loom or Vimeo
// embed link (e.g. https://www.youtube.com/embed/VIDEO_ID, https://www.loom.com/embed/VIDEO_ID)
// or a video file (.mp4, .webm), such as one in public/videos/.
export const TOUR_VIDEOS: Record<TourStepId, { url: string; length: string } | null> = {
  welcome: null,
  imports: null,
  alerts: null,
  manage: null,
  adcvd: null,
  savings: null,
  audits: null,
};

export interface TourStep {
  id: TourStepId;
  // Its name on the rail and the Next button
  rail: string;
  title: string;
  lead: string;
  how: ReactNode[];
  // "Take me there": its label, and the tab it opens (adding imports opens the import flow)
  action?: string;
  tab: SectionSlug;
  video: string | null;
  videoLength?: string;
  Visual: ComponentType<{ run: number }>;
}

const B = ({ children }: { children: ReactNode }) => <strong className="font-semibold text-base-content">{children}</strong>;

const video = (id: TourStepId) => ({ video: TOUR_VIDEOS[id]?.url ?? null, videoLength: TOUR_VIDEOS[id]?.length });

export const TOUR_STEPS: TourStep[] = [
  // Always first: what Duty Guard is for, before how
  {
    id: "welcome",
    rail: "Welcome",
    title: "Eliminate Tariff Overpayments and Surprises",
    lead: "Duty Guard watches every tariff on the products you import, around the clock, so you hear about changes before they cost you and find duty you may have overpaid.",
    how: [
      <>
        <B>Alerts</B> the day a new tariff affects your products, with the rate before and after.
      </>,
      <>
        <B>Audits</B> of your entries, to find duty you may have overpaid. You keep 100% of any refund.
      </>,
      <>
        <B>Savings</B> you may qualify for, like exemptions and trade programs.
      </>,
      <>It all runs on your imports: an HTS code and country of origin for each product.</>,
    ],
    tab: "overview",
    ...video("welcome"),
    Visual: WelcomeVisual,
  },
  {
    id: "imports",
    rail: "Add Imports",
    title: "Add the products you import",
    lead: "Everything in Duty Guard runs on your imports: an HTS code and a country of origin for each product. It takes about a minute.",
    how: [
      <>
        Open <B>Your Imports</B> and click <B>Set up my imports</B>.
      </>,
      <>Upload a spreadsheet, paste a list, or pick from your recent searches. Any file with an HTS code and a country column works.</>,
      <>
        Fix any rows we can&apos;t read (we suggest the fix), then click <B>Add my imports</B>.
      </>,
    ],
    action: "Add my imports",
    tab: "catalog",
    ...video("imports"),
    Visual: ImportsVisual,
  },
  {
    id: "alerts",
    rail: "Alerts",
    title: "Hear about tariff changes the day they hit",
    lead: "Alerts are on for every import you add. Choose where they go, and which kinds of changes they cover.",
    how: [
      <>
        Open <B>Tariff Changes</B> and choose <B>Alert Settings</B>.
      </>,
      <>
        Under <B>Where Alerts Go</B>, keep email, and connect <B>Slack</B> or <B>Microsoft Teams</B> if your team lives there.
      </>,
      <>
        Tick the updates you want, like rate changes or AD/CVD cases, then click <B>Save alert settings</B>.
      </>,
      <>Each alert shows the rate before and after, so you see what changed at a glance.</>,
    ],
    action: "Open Alert Settings",
    tab: "alerts",
    ...video("alerts"),
    Visual: AlertsVisual,
  },
  {
    id: "manage",
    rail: "Your Imports",
    title: "See every tariff on every import",
    lead: "Your Imports lists each product with today's duty rate, every tariff on it stacked up, kept current as rules change.",
    how: [
      <>Search by code, product or country, or filter by origin, tariff or alerts.</>,
      <>
        Click an import to open it. <B>Duty</B> shows every tariff that adds up to its rate; <B>History</B> shows what moved and when.
      </>,
      <>
        Select rows to turn alerts on or off or remove them, and use <B>Export</B> for Excel or CSV.
      </>,
    ],
    action: "Open Your Imports",
    tab: "catalog",
    ...video("manage"),
    Visual: ManageVisual,
  },
  {
    id: "adcvd",
    rail: "AD/CVD",
    title: "Spot antidumping and countervailing duties",
    lead: "AD/CVD duties can add far more than a regular tariff, and they're easy to miss. We flag imports a case may cover.",
    how: [
      <>
        Look for the amber <B>AD/CVD</B> chip on an import in Your Imports.
      </>,
      <>
        Open the import. Its <B>AD/CVD Cases</B> tab is marked when a case may apply; open it, or click <B>Check the cases</B> on <B>Duty</B>.
      </>,
      <>
        Answer the <B>AD/CVD Check</B>: whether it&apos;s the product the case covers, and who made and exported it. The rate depends on the exporter.
      </>,
      <>
        To hear about new cases, tick <B>AD/CVD cases</B> in Alert Settings.
      </>,
    ],
    action: "Open Your Imports",
    tab: "catalog",
    ...video("adcvd"),
    Visual: AdcvdVisual,
  },
  {
    id: "savings",
    rail: "Savings",
    title: "Find ways to pay less duty",
    lead: "We check every import for duty you may not need to pay. A short review on each one tells you which savings you may qualify for.",
    how: [
      <>
        Open <B>Savings</B> to see which imports could pay less, then open one. Or open any import and go to its <B>Savings</B> tab.
      </>,
      <>
        Click <B>Start Savings Review</B>. It asks one question at a time about your goods, with the rule each one turns on: answer <B>No</B> or{" "}
        <B>Yes, pursue it</B>.
      </>,
      <>
        It covers <B>Trade Programs</B> and <B>Exemptions</B> (same supplier, same country), then <B>Other Countries</B> if you want to look further.
      </>,
      <>
        The <B>Summary</B> shows what you could save and the next step for each. Once your broker confirms it, <B>Mark secured</B> to apply the lower rate to your import.
      </>,
    ],
    action: "Open Savings",
    tab: "savings",
    ...video("savings"),
    Visual: SavingsVisual,
  },
  {
    id: "audits",
    rail: "Audits",
    title: "Check every entry against the rate that applied",
    lead: "Enter a past entry, and we'll compare the duty you paid with the duty in force on its entry date.",
    how: [
      <>
        Open <B>Audits</B> and click <B>Audit an Entry</B>, or use the <B>Audits</B> tab on any import.
      </>,
      <>
        Type in the entry from your entry summary: its date, number and value, then the <B>Duty Paid</B>. Reading a 7501 upload is coming soon.
      </>,
      <>
        Check the <B>Adjustments</B> (what applied to it, like a trade program) and the <B>AD/CVD</B> step, then click <B>Finish</B>.
      </>,
      <>
        The <B>Results</B> put <B>You Paid</B> beside <B>We Calculated</B>, with every charge and its rate. Past audits stay on the list; open one to see its results again.
      </>,
    ],
    action: "Open Audits",
    tab: "entries",
    ...video("audits"),
    Visual: AuditsVisual,
  },
];
