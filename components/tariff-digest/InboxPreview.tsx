import { C, TONES } from "@/emails/kit/brand"
import { metaLine, type DigestItem } from "./parts"

// The digest as it lands: an inbox row (sender, subject, Monday), then the email itself with this
// week's real updates, drawn in the email's own light palette (emails/kit/brand.ts) whatever the
// page's mode, because that's how it looks in the inbox. Real copy, server-rendered.

const SORA = "[font-family:var(--font-tracker-display)]"

export const InboxPreview = ({ items, heading, period }: { items: DigestItem[]; heading: string; period: string }) => (
  <div className="relative mx-auto w-full max-w-xl" style={{ color: C.text }}>
    {/* A second sheet behind, so it reads as one in a run of Mondays */}
    <div className="absolute inset-x-8 -bottom-4 top-6 rounded-[2rem] opacity-40" style={{ backgroundColor: C.surface }} aria-hidden />
    <div className="relative overflow-hidden rounded-[2rem] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.6)]" style={{ backgroundColor: C.surface }}>
      <div className="flex items-center gap-3 border-b px-6 py-4" style={{ borderColor: C.border, backgroundColor: C.soft }}>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: C.cobalt }}>
          H
        </span>
        <div className="min-w-0 flex-1">
          <p className="m-0 flex items-baseline justify-between gap-3 text-sm">
            <span className="font-semibold">HTS Hero</span>
            <span style={{ color: C.faint }}>Mon</span>
          </p>
          <p className="m-0 truncate text-sm" style={{ color: C.muted }}>
            Your Weekly Tariff Brief
          </p>
        </div>
      </div>
      <div className="px-7 pb-8 pt-7">
        <p className="m-0 text-[11px] font-bold uppercase tracking-wider" style={{ color: C.cobalt }}>
          Weekly tariff digest · {period}
        </p>
        <p className={`${SORA} m-0 mt-2 text-2xl font-semibold leading-tight`}>{heading}</p>
        <ul className="m-0 mt-6 flex list-none flex-col p-0">
          {items.map((u, i) => (
            <li key={u.slug} className={i ? "mt-5 border-t pt-5" : ""} style={{ borderColor: C.border }}>
              <div className="flex flex-wrap gap-1.5">
                <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ color: TONES[u.tone].fg, backgroundColor: TONES[u.tone].bg }}>
                  {u.authorityLabel}
                </span>
                <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ color: C.cobalt, backgroundColor: C.cobaltSoft }}>
                  {u.stageLabel}
                </span>
              </div>
              <p className={`${SORA} m-0 mt-2.5 text-base font-semibold leading-snug`}>{u.title}</p>
              <p className="m-0 mt-1.5 line-clamp-2 text-sm leading-relaxed" style={{ color: C.muted }}>
                {u.summary}
              </p>
              {metaLine(u) && (
                <p className="m-0 mt-1.5 text-xs" style={{ color: C.faint }}>
                  {metaLine(u)}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
)
