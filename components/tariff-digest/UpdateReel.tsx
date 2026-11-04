import { TONE_DOT, TONE_TEXT, display, metaLine, type DigestItem } from "./parts"

// Beside the hero's form: the latest real US tariff actions drifting up without end, the way they
// pile up week after week. The list is drawn twice so the loop never shows a seam (globals.css
// .dg-reel); the edges fade to the band so cards arrive and leave rather than being cut. Decorative
// (the same updates are in the digest preview below), so screen readers skip it.

const SECONDS_PER_CARD = 6

export const UpdateReel = ({ items }: { items: DigestItem[] }) => {
  if (items.length < 4) return null
  return (
    <div
      aria-hidden
      className="relative h-[34rem] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)] lg:h-[40rem]"
    >
      <div className="dg-reel flex flex-col" style={{ ["--dg-reel-duration" as string]: `${items.length * SECONDS_PER_CARD}s` }}>
        {[0, 1].map((copy) => (
          <ul key={copy} className="m-0 flex list-none flex-col gap-4 p-0 pb-4">
            {items.map((u) => (
              <li key={u.slug} className="rounded-3xl border border-base-content/10 bg-base-100/70 p-5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                  <span className={`h-1.5 w-1.5 rounded-full ${TONE_DOT[u.tone]}`} />
                  <span className={TONE_TEXT[u.tone]}>{u.authorityLabel}</span>
                  <span className="text-base-content/30">·</span>
                  <span className="text-base-content/50">{u.stageLabel}</span>
                </div>
                <p className={`${display} m-0 mt-3 line-clamp-2 text-[1.05rem] font-semibold leading-snug text-base-content`}>{u.title}</p>
                {metaLine(u) && <p className="m-0 mt-2 truncate text-sm text-base-content/50">{metaLine(u)}</p>}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}
