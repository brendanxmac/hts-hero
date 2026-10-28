import { Fragment, ReactNode } from "react";
import Image from "next/image";
import { ArrowDownIcon, ArrowUturnLeftIcon, DocumentTextIcon, ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import logo from "@/app/logo.svg";
import { Reveal, SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";

// "See what you should have paid": the audit as one big picture on a soft grid. Your entry data
// flows into the HTS Hero Audit Engine (a glowing tile with a light running round its edge) and out
// to overpaid and underpaid, along curved lines with dots riding them. The steps themselves are in
// "How the audit works" (RecalcSection). On a phone the picture stacks, with arrows between.

const FLAGS = [
  { label: "Overpaid", note: "You could get it back", Icon: ArrowUturnLeftIcon, tone: "text-success ring-success/50 shadow-success/15", icon: "bg-success/15 text-success" },
  { label: "Underpaid", note: "Worth fixing before CBP asks", Icon: ExclamationTriangleIcon, tone: "text-error ring-error/50 shadow-error/15", icon: "bg-error/15 text-error" },
];

// Every item on the sides is h-16 (64px), the flags 48px apart: centers at 32 and 144 of a 176px
// stack, the entry data's and the engine's at 88
const ITEM = "flex h-16 w-full items-center gap-3 rounded-2xl bg-base-100 px-4 shadow-lg";

const VISUALS: ReactNode[] = [
  <div key="in" className={`${ITEM} shadow-base-content/5 ring-1 ring-base-300`}>
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
      <DocumentTextIcon className="h-5 w-5" aria-hidden />
    </span>
    <span className="min-w-0">
      <span className="block text-base font-semibold text-base-content">Your Entry Data</span>
      <span className="block text-xs text-base-content/60">Every line of every entry</span>
    </span>
  </div>,
  <div key="engine" className="relative w-full">
    {/* The glow behind the engine */}
    <span className="af-glow pointer-events-none absolute -inset-4 rounded-[40px] bg-primary/10 blur-3xl" aria-hidden />
    {/* A light running round its edge */}
    <div className="relative overflow-hidden rounded-[28px] p-[2px] shadow-2xl shadow-primary/20">
      <span
        className="af-spin pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[220%] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,transparent_0deg,var(--color-primary)_60deg,transparent_140deg,transparent_360deg)]"
        aria-hidden
      />
      <span className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-inset ring-primary/40" aria-hidden />
      <div className="relative flex flex-col items-center gap-3 rounded-[26px] bg-base-100 px-5 py-8 text-center">
        <Image src={logo} alt="" width={56} height={56} />
        <p className="text-xl font-semibold leading-tight text-base-content [font-family:var(--font-tracker-display)]">HTS Hero Audit Engine</p>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Rates in force on each entry date</p>
      </div>
    </div>
  </div>,
  <div key="out" className="flex w-full flex-col gap-12">
    {FLAGS.map(({ label, note, Icon, tone, icon }) => (
      <div key={label} className={`${ITEM} ring-2 ${tone}`}>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${icon}`}>
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block text-lg font-bold leading-tight">{label}</span>
          <span className="block text-xs text-base-content/60">{note}</span>
        </span>
      </div>
    ))}
  </div>,
];

// The curves between the columns, one per item: your entry data into the engine, and the engine out
// to each flag. Two dots ride each curve (SVG animation, no script; hidden for reduced motion).
const LINK_W = 104;
const LINK_H = 176;
const MID = LINK_H / 2;
const ENDS = [32, 144];
const curve = (from: number, to: number) => `M 0 ${from} C ${LINK_W / 2} ${from}, ${LINK_W / 2} ${to}, ${LINK_W} ${to}`;
const LINKS = [
  [{ d: curve(MID, MID), color: "var(--color-primary)" }],
  ENDS.map((y, n) => ({ d: curve(MID, y), color: n === 0 ? "var(--color-success)" : "var(--color-error)" })),
];
const DUR = 2.4;

const Connector = ({ i }: { i: number }) => (
  <div className="flex items-center justify-center py-1 md:py-0" aria-hidden>
    <ArrowDownIcon className="h-6 w-6 text-base-content/30 md:hidden" />
    <svg width={LINK_W} height={LINK_H} viewBox={`0 0 ${LINK_W} ${LINK_H}`} className="hidden overflow-visible md:block">
      {LINKS[i].map((l, n) => (
        <path key={n} d={l.d} fill="none" stroke={l.color} strokeOpacity="0.4" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={i === 0 ? "5 6" : undefined} />
      ))}
      <g className="motion-reduce:hidden">
        {LINKS[i].flatMap((l, n) =>
          [0, DUR / 2].map((offset) => {
            const begin = `${i * 1.2 + n * 0.6 + offset}s`;
            return (
              // Hidden until its first run, so it doesn't wait at the corner
              <circle key={`${n}-${offset}`} r="5.5" fill={l.color} opacity="0">
                <set attributeName="opacity" to="1" begin={begin} />
                <animateMotion dur={`${DUR}s`} begin={begin} repeatCount="indefinite" path={l.d} />
              </circle>
            );
          })
        )}
      </g>
    </svg>
  </div>
);

// A screen of its own on desktop, like the hero, content centered, so it reads as a moment in the
// page rather than a strip between two sections
export const AuditFlow = () => (
  <section
    className={`${mk.bandMuted} relative flex items-center overflow-hidden py-28 sm:py-40 lg:min-h-[calc(100svh-65px)]`}
    aria-labelledby="flow-title"
  >
    <style>{`
      @media (prefers-reduced-motion: no-preference) {
        .af-spin { animation: af-spin 4s linear infinite; }
        .af-glow { animation: af-glow 4s ease-in-out infinite; }
      }
      @keyframes af-spin { to { transform: translate(-50%, -50%) rotate(360deg); } }
      @keyframes af-glow { 0%, 100% { opacity: .55; } 50% { opacity: 1; } }
    `}</style>
    {/* A faint grid, fading out at the edges */}
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 bg-[linear-gradient(var(--color-base-300)_1px,transparent_1px),linear-gradient(90deg,var(--color-base-300)_1px,transparent_1px)] bg-size-[40px_40px] opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
    />
    {/* A soft glow behind the picture, and the edges fading into the sections around it */}
    <div aria-hidden className="pointer-events-none absolute left-1/2 top-[58%] h-[28rem] w-[60rem] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.04] blur-3xl" />
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-base-100/60 to-transparent" />
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-black/20 to-transparent" />
    <div className={`${mk.container} relative`}>
      <SectionIntro eyebrow="" title={<>We check what you <span className={mk.accent}>should have</span> <br />paid on every entry</>} id="flow-title" center>
        You upload your entries, we check every line and flag possible over or underpayments.
      </SectionIntro>
      <Reveal className="mx-auto mt-20 max-w-6xl lg:mt-24">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.15fr)_auto_minmax(0,1fr)] md:gap-0">
          {VISUALS.map((v, i) => (
            <Fragment key={i}>
              <div className="flex items-center">{v}</div>
              {i < VISUALS.length - 1 && <Connector i={i} />}
            </Fragment>
          ))}
        </div>
      </Reveal>
    </div>
  </section>
);
