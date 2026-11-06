import { Palette, toneColor } from "../brand";
import { display } from "../fonts";
import {
  alpha,
  Enter,
  Frame,
  longDate,
  useLayout,
  usd,
} from "../kit";
import type { NewsProps } from "../types";

// A tariff action from the /tariff-updates feed, read like a wire alert: where it stands and the
// law behind it, a huge headline, one plain summary, then a row of facts on who it hits (rate,
// countries, HTS codes, date, imports at stake). Just the update, set big enough to read at a
// glance in a feed; the link to the update's page is in the caption.

interface Stat {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}

const StatTile = ({
  s,
  p,
  u,
  wide,
  at,
}: {
  s: Stat;
  p: Palette;
  u: number;
  wide: boolean;
  at: number;
}) => (
  <Enter at={at} style={{ minWidth: 0 }}>
    <div
      style={{
        borderTop: `${4 * u}px solid ${s.color ?? p.text}`,
        paddingTop: (wide ? 14 : 22) * u,
        display: "flex",
        flexDirection: "column",
        gap: (wide ? 4 : 8) * u,
      }}
    >
      <span
        style={{
          fontSize: (wide ? 20 : 26) * u,
          fontWeight: 700,
          letterSpacing: 1.5 * u,
          textTransform: "uppercase",
          color: p.muted,
        }}
      >
        {s.label}
      </span>
      <span
        style={{
          fontFamily: display,
          fontWeight: 700,
          fontSize: (wide ? 56 : s.value.length > 11 ? 64 : 84) * u,
          lineHeight: 1.02,
          letterSpacing: -2.5 * u,
          color: s.color ?? p.text,
          overflowWrap: "anywhere",
        }}
      >
        {s.value}
      </span>
      {s.sub && (
        <span
          style={{
            fontSize: (wide ? 22 : 30) * u,
            fontWeight: 500,
            color: p.muted,
            lineHeight: 1.25,
          }}
        >
          {s.sub}
        </span>
      )}
    </div>
  </Enter>
);

// Sized for a headline set as the poster's main line
const headlineSize = (text: string, wide: boolean) => {
  const max = wide ? 76 : 124;
  return text.length > 70
    ? max * 0.72
    : text.length > 50
      ? max * 0.8
      : text.length > 32
        ? max * 0.9
        : max;
};

export const News = (props: NewsProps) => {
  const {
    theme,
    headline,
    dek,
    authority,
    kindLabel,
    tone,
    rateBefore,
    rateAfter,
    rateNote,
    countries,
    products,
    effectiveOn,
    stage,
    imports,
    htsCount,
    asOf,
  } = props;
  const { p, u, wide } = useLayout(theme);
  const color = toneColor(p, tone);
  const inEffect = stage >= 4 || (!!effectiveOn && effectiveOn <= asOf);
  const status = inEffect ? "Now in effect" : "Announced";

  const flags = countries
    .slice(0, 8)
    .map((c) => c.flag)
    .join(" ");
  const stats: Stat[] = [];
  if (rateAfter)
    stats.push({
      label: "Tariff rate",
      value: `${rateBefore ? `${rateBefore} → ` : ""}${rateAfter}`,
      sub: rateNote || undefined,
      color,
    });
  stats.push(
    countries.length === 0
      ? { label: "Countries", value: "All", sub: "Imports from every country" }
      : countries.length === 1
        ? { label: "Country", value: countries[0].name, sub: countries[0].flag }
        : {
            label: "Countries",
            value: String(countries.length),
            sub: `${flags}${countries.length > 8 ? ` +${countries.length - 8}` : ""}`,
          },
  );
  if (htsCount)
    stats.push({
      label: "HTS codes",
      value: String(htsCount),
      sub: "named in the action",
    });
  if (effectiveOn)
    stats.push({
      label: inEffect ? "In effect since" : "Takes effect",
      value: longDate(effectiveOn).replace(/, \d{4}$/, ""),
      sub: effectiveOn.slice(0, 4),
    });
  if (imports && imports.value > 0)
    stats.push({
      label: "Imports at stake",
      value: usd(imports.value),
      sub: `US imports, ${imports.year}`,
      color: p.cobalt,
    });
  // Products go in the tiles only when short enough to set big
  if (stats.length < 4 && products && products.length <= 22)
    stats.push({ label: "Products", value: products, sub: undefined });
  const shown = stats.slice(0, 4);
  const columns = wide ? Math.min(shown.length, 4) : 2;

  return (
    <Frame
      theme={theme}
      kind="Tariff news"
      kindTone={tone}
      source={props.source}
      asOf={props.asOf}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: (wide ? 20 : 34) * u,
          minHeight: 0,
        }}
      >
        {/* The update, centered in the frame when there are few facts */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: (wide ? 24 : 44) * u,
          }}
        >
          <Enter>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16 * u,
                flexWrap: "wrap",
                fontSize: (wide ? 22 : 30) * u,
                fontWeight: 700,
                letterSpacing: 2 * u,
                textTransform: "uppercase",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10 * u,
                  color,
                }}
              >
                <span
                  style={{
                    width: 18 * u,
                    height: 18 * u,
                    borderRadius: 999,
                    background: color,
                    boxShadow: `0 0 0 ${6 * u}px ${alpha(color, 0.2)}`,
                  }}
                />
                {status}
              </span>
              <span style={{ color: p.border }}>|</span>
              <span style={{ color: p.muted }}>
                {authority} · {kindLabel}
              </span>
            </div>
          </Enter>

          <Enter at={0.15}>
            <div
              style={{
                fontFamily: display,
                fontWeight: 700,
                fontSize: headlineSize(headline, wide) * u,
                lineHeight: 1.02,
                letterSpacing: -3.5 * u,
                color: p.text,
              }}
            >
              {headline}
            </div>
            {dek && (
              <div
                style={{
                  marginTop: (wide ? 16 : 30) * u,
                  fontSize: (wide ? 28 : 40) * u,
                  lineHeight: 1.3,
                  color: alpha(p.text, 0.78),
                  fontWeight: 500,
                  maxWidth: wide ? "92%" : undefined,
                }}
              >
                {dek}
              </div>
            )}
          </Enter>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              columnGap: (wide ? 28 : 40) * u,
              rowGap: (wide ? 18 : 36) * u,
            }}
          >
            {shown.map((s, i) => (
              <StatTile
                key={s.label}
                s={s}
                p={p}
                u={u}
                wide={wide}
                at={0.5 + i * 0.12}
              />
            ))}
          </div>
        </div>

      </div>
    </Frame>
  );
};
