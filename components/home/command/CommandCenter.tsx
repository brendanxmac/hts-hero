"use client";

import { useEffect, useState } from "react";
import {
  BanknotesIcon,
  BellAlertIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentCheckIcon,
  EnvelopeIcon,
  SignalIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { mono } from "@/components/ui/font";

// The homepage hero's picture of the product, for an example account: one catalog table, scanned
// three times. Each pass (monitoring, savings, audit) sweeps the rows and fills its own column as
// the scan line passes, while that layer's tile counts up live. Earlier layers stay filled, so by
// the end the table shows the whole picture. Then the results are shared to each channel over
// the table, and it starts over.
//
// Tariff changes and audit reasons are real 2026 rules; products, volumes and amounts are
// illustrative. Each tile's total is the sum of its own column.

type Tone = "bad" | "good" | "info" | "none";
interface Cell {
  label: string;
  value?: string;
  tone: Tone;
  amount?: number;
}

const ROWS: {
  name: string;
  code: string;
  origin: string;
  monitor: Cell;
  savings: Cell;
  audit: Cell;
}[] = [
  {
    name: "Lager beer",
    code: "2203.00",
    origin: "CA",
    monitor: { label: "Section 338", value: "+50%", tone: "bad" },
    savings: { label: "—", tone: "none" },
    audit: { label: "OK", tone: "none" },
  },
  {
    name: "Drones, 2–7 kg",
    code: "8806.22",
    origin: "CN",
    monitor: { label: "Section 232", value: "+25%", tone: "bad" },
    savings: { label: "—", tone: "none" },
    audit: { label: "OK", tone: "none" },
  },
  {
    name: "Clinical-trial drugs",
    code: "3004.90",
    origin: "IE",
    monitor: { label: "Exemption", value: "−15%", tone: "good" },
    savings: {
      label: "Exemption",
      value: "$40,000/yr",
      tone: "good",
      amount: 40000,
    },
    audit: { label: "OK", tone: "none" },
  },
  {
    name: "Aluminum extrusions",
    code: "7604.29",
    origin: "CA",
    monitor: { label: "No change", tone: "none" },
    savings: {
      label: "USMCA",
      value: "$36,000/yr",
      tone: "good",
      amount: 36000,
    },
    audit: { label: "Overpaid", value: "+$3,000", tone: "good", amount: 3000 },
  },
  {
    name: "Steel wire",
    code: "7217.10",
    origin: "CN",
    monitor: { label: "No change", tone: "none" },
    savings: {
      label: "Drawback",
      value: "$18,400/yr",
      tone: "good",
      amount: 18400,
    },
    audit: { label: "Overpaid", value: "+$4,000", tone: "good", amount: 4000 },
  },
  {
    name: "Cotton T-shirts",
    code: "6109.10",
    origin: "VN",
    monitor: { label: "No change", tone: "none" },
    savings: { label: "—", tone: "none" },
    audit: {
      label: "Refundable",
      value: "+$5,000",
      tone: "info",
      amount: 5000,
    },
  },
  {
    name: "Wood chairs",
    code: "9401.61",
    origin: "VN",
    monitor: { label: "No change", tone: "none" },
    savings: { label: "—", tone: "none" },
    audit: { label: "Underpaid", value: "−$1,850", tone: "bad" },
  },
];
const CATALOG_SIZE = 248;

const LAYERS = [
  {
    key: "monitor" as const,
    label: "Changes",
    column: "Changes",
    Icon: SignalIcon,
    accent: "text-primary",
    ring: "ring-primary",
    bar: "bg-primary",
    scanColor: "via-primary/20",
  },
  {
    key: "savings" as const,
    label: "Savings",
    column: "Savings",
    Icon: BanknotesIcon,
    accent: "text-success",
    ring: "ring-success",
    bar: "bg-success",
    scanColor: "via-success/20",
  },
  {
    key: "audit" as const,
    label: "Audits",
    column: "Audit",
    Icon: ClipboardDocumentCheckIcon,
    accent: "text-warning",
    ring: "ring-warning",
    bar: "bg-warning",
    scanColor: "via-warning/20",
  },
];

const ROW_MS = 380;
const HOLD_MS = 1800;
// The finale: each channel lights up in turn, then the summary holds before starting over
const SHARE_STEP_MS = 650;
const SHARE_HOLD_MS = 3000;

// Where the results go once every scan is done
const CHANNELS = [
  {
    name: "Slack",
    Icon: ChatBubbleLeftRightIcon,
    tint: "bg-warning/10 text-warning",
  },
  {
    name: "Teams",
    Icon: UsersIcon,
    tint: "bg-warning/10 text-warning",
  },
  {
    name: "Email",
    Icon: EnvelopeIcon,
    tint: "bg-error/10 text-error",
  },
  {
    name: "In-app",
    Icon: BellAlertIcon,
    tint: "bg-primary/10 text-primary",
  },
];
// Each row's height in rem, which the scan line steps by
const ROW_H = 2.75;

const usd = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
const sumOf = (key: "savings" | "audit", upTo: number) =>
  ROWS.slice(0, upTo).reduce((s, r) => s + (r[key].amount ?? 0), 0);

const TONE: Record<Tone, string> = {
  bad: "bg-error/10 text-error",
  good: "bg-success/10 text-success",
  info: "bg-warning/10 text-warning",
  none: "text-base-content/60",
};

// A layer's finding for one product: a short label over the amount, or a quiet "nothing here"
const ResultCell = ({
  cell,
  shown,
  fresh,
}: {
  cell: Cell;
  shown: boolean;
  fresh: boolean;
}) => (
  <td className="px-1.5 align-middle">
    {!shown ? (
      <span className="text-[11px] text-base-content/40">·</span>
    ) : cell.value ? (
      <span
        className={`inline-flex max-w-full flex-col rounded-md px-1.5 py-0.5 leading-tight transition-transform duration-500 ${TONE[cell.tone]} ${fresh ? "scale-110" : "scale-100"}`}
      >
        <span className="truncate text-[10px] font-semibold opacity-80">
          {cell.label}
        </span>
        <span className="text-xs font-bold tabular-nums">{cell.value}</span>
      </span>
    ) : (
      <span className="text-[11px] text-base-content/60">{cell.label}</span>
    )}
  </td>
);

export const CommandCenter = () => {
  // The layer being scanned, how many rows its scan has passed, and whether it's holding at the end
  const [layer, setLayer] = useState(0);
  const [rows, setRows] = useState(0);
  const [holding, setHolding] = useState(false);
  // Once every scan is done: how many channels have been sent to (null while scanning)
  const [shared, setShared] = useState<number | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setLayer(LAYERS.length - 1);
      setRows(ROWS.length);
      setHolding(true);
      setShared(CHANNELS.length + 1);
      return;
    }
    let delay: number;
    let next: () => void;
    if (shared !== null) {
      // Light up each channel, then hold the summary and start over
      if (shared <= CHANNELS.length) {
        delay = SHARE_STEP_MS;
        next = () => setShared(shared + 1);
      } else {
        delay = SHARE_HOLD_MS;
        next = () => {
          setShared(null);
          setHolding(false);
          setRows(0);
          setLayer(0);
        };
      }
    } else if (rows < ROWS.length) {
      delay = ROW_MS;
      next = () => setRows((r) => r + 1);
    } else if (!holding) {
      delay = 0;
      next = () => setHolding(true);
    } else if (layer === LAYERS.length - 1) {
      // Every scan is done: share the results
      delay = HOLD_MS;
      next = () => setShared(0);
    } else {
      delay = HOLD_MS;
      next = () => {
        setHolding(false);
        setRows(0);
        setLayer((l) => l + 1);
      };
    }
    const id = setTimeout(next, delay);
    return () => clearTimeout(id);
  }, [layer, rows, holding, shared]);

  const jump = (i: number) => {
    setShared(null);
    setLayer(i);
    setRows(0);
    setHolding(false);
  };

  // How far each layer's column is filled: earlier layers fully, the current one up to the scan
  const filled = (i: number) =>
    i < layer ? ROWS.length : i === layer ? rows : 0;
  const scanning = rows < ROWS.length;
  const current = LAYERS[layer];

  const changesFound = ROWS.slice(0, filled(0)).filter(
    (r) => r.monitor.tone !== "none",
  ).length;
  const tileValue = [
    String(changesFound),
    usd(sumOf("savings", filled(1))),
    usd(sumOf("audit", filled(2))),
  ];
  const tileSub = [
    "since last week",
    filled(1) === ROWS.length
      ? "a year, ready for review"
      : filled(1)
        ? "found so far…"
        : "pending...",
    filled(2) === ROWS.length
      ? "overpaid duty found"
      : filled(2)
        ? "found so far…"
        : "pending...",
  ];

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-base-300 bg-base-100 p-4 sm:p-6"
      aria-label="Example HTS Hero account"
    >
      {/* While sharing, the dashboard steps aside (kept in place, so the card keeps its size) */}
      <div
        className={`transition-opacity duration-500 ${shared !== null ? "invisible opacity-0" : "opacity-100"}`}
      >
        <div className="mb-4 flex items-center justify-between px-1">
          <p className="text-sm font-semibold text-base-content">
            Your Product Catalog
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />{" "}
            Watching 24/7
          </span>
        </div>

        <div
          className="grid grid-cols-3 gap-2.5"
          role="tablist"
          aria-label="What HTS Hero does for this account"
        >
          {LAYERS.map(({ key, label, Icon, accent, ring, bar }, i) => {
            const on = i === layer;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => jump(i)}
                className={`relative overflow-hidden rounded-2xl bg-tt-soft p-3.5 text-left transition-all ${on ? `ring-2 ${ring}` : "ring-1 ring-transparent hover:ring-base-300"}`}
              >
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-base-content/60">
                  <Icon className={`h-4 w-4 ${accent}`} aria-hidden /> {label}
                </span>
                <span
                  className={`mt-1.5 block text-2xl font-semibold [font-family:var(--font-tracker-display)] tabular-nums transition-colors ${filled(i) ? accent : "text-base-content/40"}`}
                >
                  {tileValue[i]}
                </span>
                <span className="block text-xs text-base-content/60">
                  {tileSub[i]}
                </span>
                {/* How much of this layer's scan is done; the width is a runtime value */}
                <span
                  className={`absolute bottom-0 left-0 h-1 ${bar} transition-[width] duration-300`}
                  style={{ width: `${(filled(i) / ROWS.length) * 100}%` }}
                  aria-hidden
                />
              </button>
            );
          })}
        </div>

        <div className="relative mt-3 overflow-hidden rounded-2xl border border-base-300 bg-base-100">
          <table className="w-full table-fixed text-left">
            <thead>
              <tr className="h-8 border-b border-base-300 text-[11px] uppercase tracking-wider text-base-content/60">
                <th className="w-[31%] px-3 font-semibold">Your catalog</th>
                {LAYERS.map((l, i) => (
                  <th
                    key={l.key}
                    className={`px-1.5 font-semibold transition-colors ${i === layer ? l.accent : ""}`}
                  >
                    {l.column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, ri) => (
                // Rows have a fixed height so the scan line can step through them
                <tr
                  key={r.code}
                  className="border-b border-base-300 last:border-0"
                  style={{ height: `${ROW_H}rem` }}
                >
                  <td className="px-3 leading-tight">
                    <span className="block truncate text-[13px] font-semibold text-base-content">
                      {r.name}
                    </span>
                    <span
                      className={`${mono.className} block truncate text-[10px] text-base-content/60`}
                    >
                      {r.code} · {r.origin}
                    </span>
                  </td>
                  {LAYERS.map((l, li) => (
                    <ResultCell
                      key={l.key}
                      cell={r[l.key]}
                      shown={ri < filled(li)}
                      fresh={scanning && li === layer && ri === rows - 1}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {scanning && (
            // The scan line, on the row being checked; its position is a runtime value
            <div
              aria-hidden
              className={`pointer-events-none absolute inset-x-0 h-10 bg-gradient-to-b from-transparent ${current.scanColor} to-transparent transition-[top] duration-300 ease-linear`}
              style={{ top: `calc(2rem + ${rows * ROW_H}rem)` }}
            />
          )}
          <p className="border-t border-base-300 px-3 py-1.5 text-center text-xs text-base-content/60">
            + {CATALOG_SIZE - ROWS.length} more products watched
          </p>
        </div>
      </div>

      {shared !== null && (
        // The finale: the results going out to each channel in turn
        <div
          className="absolute inset-0 flex animate-[opacity_0.5s_ease-out] flex-col items-center justify-center bg-base-100 px-6 text-center"
          aria-live="polite"
        >
          <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-base-content text-base-100">
            <BellAlertIcon className="h-8 w-8" aria-hidden />
            {shared <= CHANNELS.length && (
              <span
                className="absolute inset-0 rounded-2xl ring-4 ring-primary/60 motion-safe:animate-ping"
                aria-hidden
              />
            )}
          </span>
          <p className="mt-6 text-2xl font-semibold [font-family:var(--font-tracker-display)] tracking-tight text-base-content">
            {shared > CHANNELS.length
              ? "Shared with your team"
              : "Sharing with your team…"}
          </p>
          <ul className="mt-8 grid w-full max-w-md grid-cols-4 gap-3">
            {CHANNELS.map(({ name, Icon, tint }, i) => {
              const sent = shared > i;
              return (
                <li key={name} className="flex flex-col items-center gap-2">
                  <span
                    className={`relative flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-500 ${tint} ${
                      shared >= i
                        ? "scale-100 opacity-100"
                        : "scale-75 opacity-30"
                    }`}
                  >
                    <Icon className="h-7 w-7" aria-hidden />
                    <span
                      className={`absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-base-100 shadow transition-all duration-300 ${sent ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}
                    >
                      <CheckCircleIcon
                        className="h-6 w-6 text-success"
                        aria-hidden
                      />
                    </span>
                  </span>
                  <span className="text-xs font-semibold text-base-content/70">
                    {name}
                  </span>
                </li>
              );
            })}
          </ul>
          <p
            className={`mt-8 flex items-center gap-2 text-sm text-base-content/60 transition-opacity duration-500 ${shared > CHANNELS.length ? "opacity-100" : "opacity-0"}`}
          >
            <span className="flex -space-x-1.5" aria-hidden>
              {["bg-primary", "bg-success", "bg-warning"].map((c) => (
                <span
                  key={c}
                  className={`h-6 w-6 rounded-full ring-2 ring-base-100 ${c}`}
                />
              ))}
            </span>
            3 teammates notified
          </p>
        </div>
      )}
    </div>
  );
};
