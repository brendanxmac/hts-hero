"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CheckCircleIcon, ExclamationTriangleIcon, ArrowUturnLeftIcon } from "@heroicons/react/20/solid";
import logo from "@/app/logo.svg";
import { mono } from "@/components/ui/font";
import type { AuditScan, ScanVerdict } from "@/libs/tariff-audit-example";

// The hero's picture: one new entry at a time, scanned, then its verdict: overpaid, underpaid or
// paid right. Swipes through the three engine-checked entries (getAuditScans) like a carousel, the
// dots under it moving with the swipe. Inverted from the page's theme, like the alerts hero. Still,
// on the first result, for people who turn motion off.

const SCAN_MS = 1800;
const SHOW_MS = 3600;
// One entry swipes out to the left as the next swipes in, and the dot under it moves with it
const SWIPE_MS = 600;

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const day = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

const VERDICT: Record<ScanVerdict, { title: (d: number) => string; note: string; tone: string; Icon: typeof CheckCircleIcon }> = {
  overpaid: {
    title: (d) => `Overpaid ${usd(d)}`,
    note: "You could get this back",
    tone: "bg-success text-success-content",
    Icon: ArrowUturnLeftIcon,
  },
  underpaid: {
    title: (d) => `Underpaid ${usd(d)}`,
    note: "Worth fixing before CBP asks",
    tone: "bg-warning text-warning-content",
    Icon: ExclamationTriangleIcon,
  },
  correct: {
    title: () => "Paid correctly",
    note: "Nothing to do",
    tone: "bg-base-content text-base-100",
    Icon: CheckCircleIcon,
  },
};

type SlideState = "idle" | "scan" | "result";

// One entry. idle looks like scanning without the sweep: the next entry, waiting its turn
const Slide = ({ s, state }: { s: AuditScan; state: SlideState }) => {
  const v = VERDICT[s.verdict];
  const done = state === "result";
  return (
    <div className="relative w-full shrink-0 px-6 pb-6 pt-6">
      {/* The scan line, sweeping the entry */}
      {state === "scan" && (
        <span className="es-sweep pointer-events-none absolute inset-x-0 top-full h-16 -translate-y-1/2 bg-linear-to-b from-transparent via-primary/25 to-transparent" aria-hidden>
          <span className="absolute inset-x-0 top-1/2 h-0.5 bg-primary" />
        </span>
      )}

      {/* The entry */}
      <p className="text-2xl font-semibold text-base-content [font-family:var(--font-tracker-display)]">{s.product}</p>
      <p className={`${mono.className} mt-1 text-xs text-base-content/55`}>
        {s.htsno} · {s.countryName} · entered {day(s.entryDate)}
      </p>

      <dl className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-tt-soft p-4 ring-1 ring-base-300">
          <dt className="text-xs font-semibold text-base-content/60">You paid</dt>
          <dd className="mt-1 text-3xl font-bold tabular-nums text-base-content [font-family:var(--font-tracker-display)]">{usd(s.paid)}</dd>
        </div>
        <div className="rounded-2xl bg-tt-soft p-4 ring-1 ring-base-300">
          <dt className="text-xs font-semibold text-base-content/60">You should have paid</dt>
          <dd className="mt-1 text-3xl font-bold tabular-nums text-base-content [font-family:var(--font-tracker-display)]">
            {done ? usd(s.owed) : <span className="text-base-content/30">$ · · ·</span>}
          </dd>
        </div>
      </dl>

      {/* The verdict */}
      <div className="mt-4 h-[72px]">
        {done ? (
          <div className={`es-pop flex h-full items-center gap-3 rounded-2xl px-5 ${v.tone}`}>
            <v.Icon className="h-7 w-7 shrink-0" aria-hidden />
            <div>
              <p className="text-xl font-bold leading-tight [font-family:var(--font-tracker-display)]">{v.title(Math.abs(s.paid - s.owed))}</p>
              <p className="text-sm opacity-80">{v.note}</p>
            </div>
          </div>
        ) : (
          <p className="flex h-full items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/40 text-sm font-semibold text-primary">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" /> Checking against the rates on {day(s.entryDate)}…
          </p>
        )}
      </div>
    </div>
  );
};

export const EntryScanCard = ({ scans }: { scans: AuditScan[] }) => {
  // Where the track is. The first entry is repeated at the end, so the last swipes forward into it
  // and the track then jumps back to the start unseen: always the same direction
  const [pos, setPos] = useState(0);
  const [phase, setPhase] = useState<"scan" | "result" | "swipe">("scan");
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("result");
      return;
    }
    let t: ReturnType<typeof setTimeout>;
    let at = 0;
    const scan = () => {
      setPhase("scan");
      t = setTimeout(() => {
        setPhase("result");
        t = setTimeout(() => {
          at += 1;
          setAnimate(true);
          setPhase("swipe");
          setPos(at);
          t = setTimeout(() => {
            // On the repeated first entry: back to the real one, without a transition
            if (at === scans.length) {
              at = 0;
              setAnimate(false);
              setPos(0);
            }
            scan();
          }, SWIPE_MS);
        }, SHOW_MS);
      }, SCAN_MS);
    };
    scan();
    return () => clearTimeout(t);
  }, [scans.length]);

  if (scans.length === 0) return null;
  const slides = [...scans, scans[0]];
  const stateOf = (k: number): SlideState => {
    if (k === pos) return phase === "swipe" ? "idle" : phase;
    if (k === pos - 1 && phase === "swipe") return "result";
    return "idle";
  };

  return (
    <figure className="flex flex-col items-center" aria-label="An entry audit, scanning one entry at a time">
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .es-sweep { animation: es-sweep ${SCAN_MS}ms ease-in-out; }
          .es-pop { animation: es-pop 380ms cubic-bezier(.2,1.4,.4,1); }
        }
        @keyframes es-sweep { from { top: 0%; } to { top: 100%; } }
        @keyframes es-pop { from { opacity: 0; transform: scale(.92); } to { opacity: 1; transform: scale(1); } }
      `}</style>
      <div className="hts-tracker-inverse w-full max-w-lg overflow-hidden rounded-[28px] bg-base-100 text-base-content shadow-2xl shadow-base-content/10 ring-1 ring-base-300">
        {/* Who's checking */}
        <div className="flex items-center gap-3 border-b border-base-300 px-6 py-4">
          <Image src={logo} alt="HTS Hero" width={32} height={32} />
          <p className="flex-1 font-semibold text-base-content">Entry Audit</p>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-primary">New entry</span>
        </div>

        {/* The entries, side by side on a track that swipes */}
        <div className="overflow-hidden">
          <div
            className="flex ease-in-out motion-reduce:transition-none"
            // Only the swipe forward moves; the jump back to the real first entry is instant, unseen
            style={{
              transform: `translateX(-${pos * 100}%)`,
              transitionProperty: animate ? "transform" : "none",
              transitionDuration: animate ? `${SWIPE_MS}ms` : "0ms",
            }}
          >
            {slides.map((x, k) => (
              <Slide key={k} s={x} state={stateOf(k)} />
            ))}
          </div>
        </div>
      </div>

      {/* Which of the three, moving with the swipe */}
      <div className="mt-5 flex gap-2" aria-hidden>
        {scans.map((x, n) => (
          <span
            key={x.htsno}
            className={`h-1.5 rounded-full transition-all ease-in-out ${n === pos % scans.length ? "w-6 bg-primary" : "w-1.5 bg-base-content/20"}`}
            style={{ transitionDuration: `${SWIPE_MS}ms` }}
          />
        ))}
      </div>
    </figure>
  );
};
