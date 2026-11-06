import { C, TONES } from "@/emails/kit/brand"
import type { DigestItem } from "./parts"

// The "as it happens" emails as they land: a short run of inbox rows, one per real recent tariff
// action (AD/CVD among them), newest on top, each with the day it came in. Drawn in the email's own
// light palette (emails/kit/brand.ts) like InboxPreview, so the two read as the same sender.

const SORA = "[font-family:var(--font-tracker-display)]"

export const AlertStack = ({ alerts }: { alerts: { item: DigestItem; day: string }[] }) => (
  <div className="mx-auto flex w-full max-w-xl flex-col gap-3" style={{ color: C.text }}>
    {alerts.map(({ item: u, day }, i) => (
      <div
        key={u.slug}
        className="flex items-start gap-4 rounded-3xl px-5 py-4 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]"
        style={{ backgroundColor: C.surface, opacity: 1 - i * 0.18, transform: `scale(${1 - i * 0.03})` }}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: C.cobalt }} aria-hidden>
          H
        </span>
        <div className="min-w-0 flex-1">
          <p className="m-0 flex items-baseline justify-between gap-3 text-sm">
            <span className="font-semibold">HTS Hero</span>
            <span style={{ color: C.faint }}>{day}</span>
          </p>
          <p className={`${SORA} m-0 mt-1 line-clamp-2 text-[15px] font-semibold leading-snug`}>{u.title}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ color: TONES[u.tone].fg, backgroundColor: TONES[u.tone].bg }}>
              {u.authorityLabel}
            </span>
            <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ color: C.cobalt, backgroundColor: C.cobaltSoft }}>
              {u.stageLabel}
            </span>
          </div>
        </div>
      </div>
    ))}
  </div>
)
