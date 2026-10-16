"use client";

import { useMemo, useState } from "react";
import * as tt from "@/components/ui/styles/tracker";
import { formatRate } from "../../formatRate";
import { breakdown, chapterName, chapterOf, InsightsInput, rateOn } from "../lib/data";
import { InsightPanel, ShowAll } from "../shared";

// Which tariffs hit which chapters: the catalog's biggest chapters down the side, its biggest
// tariffs across, and what each tariff adds on average to the chapter's imports. One hue, cobalt,
// deeper for more (DESIGN_SYSTEM §15: the heat ramp); empty cells stay soft.

const heat = (pct: number) => `color-mix(in srgb, oklch(var(--p)) ${Math.min(92, 14 + pct * 2.8)}%, transparent)`;

export const ChapterHeat = ({ input }: { input: InsightsInput }) => {
  const [all, setAll] = useState(false);
  const { chapters, programs, cells, hottest, hidden } = useMemo(() => {
    const allChapters = breakdown(input, "chapter").sort((a, b) => b.imports - a.imports);
    // Tariffs that still apply today
    const allPrograms = breakdown(input, "program").filter((r) => r.avgRate > 0.005).sort((a, b) => b.dutyShare - a.dutyShare);
    const chapters = all ? allChapters : allChapters.slice(0, 8);
    const programs = all ? allPrograms : allPrograms.slice(0, 5);
    const hidden = { chapters: allChapters.length - 8, programs: allPrograms.length - 5 };
    const cells = chapters.map((ch) => {
      const inChapter = input.products.filter((p) => chapterOf(p) === ch.key);
      return programs.map((pr) => {
        const sum = inChapter.reduce((s, p) => s + rateOn(p, input.histories, input.today).parts.filter((x) => x.key === pr.key).reduce((a, x) => a + x.pct, 0), 0);
        return inChapter.length ? sum / inChapter.length : 0;
      });
    });
    let hottest: { chapter: string; program: string; pct: number } | null = null;
    cells.forEach((row, i) =>
      row.forEach((pct, j) => {
        if (programs[j].key !== "Base duty" && (!hottest || pct > hottest.pct)) hottest = { chapter: chapters[i].key, program: programs[j].label, pct };
      })
    );
    return { chapters, programs, cells, hidden, hottest: hottest as { chapter: string; program: string; pct: number } | null };
  }, [input, all]);
  const more = [
    hidden.chapters > 0 ? `${hidden.chapters} more ${hidden.chapters === 1 ? "chapter" : "chapters"}` : null,
    hidden.programs > 0 ? `${hidden.programs} more ${hidden.programs === 1 ? "tariff" : "tariffs"}` : null,
  ].filter(Boolean);

  return (
    <InsightPanel
      id="ti-heat"
      title="Tariffs by Chapter"
      subtitle="What each tariff adds, on average, to the imports in your biggest chapters. Deeper blue adds more."
      lesson={
        hottest && hottest.pct > 0.005 ? (
          <>
            <b>{hottest.program}</b> weighs most on Chapter {hottest.chapter} ({chapterName(hottest.chapter, input.sections) ?? "this chapter"}), adding{" "}
            {formatRate(hottest.pct)} on average.
          </>
        ) : undefined
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-1.5 text-sm tabular-nums">
          <thead>
            <tr>
              <th scope="col" className="text-left text-xs font-medium text-base-content/60">
                Chapter
              </th>
              {programs.map((p) => (
                <th key={p.key} scope="col" className="text-xs font-medium text-base-content/60">
                  {p.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {chapters.map((ch, i) => (
              <tr key={ch.key}>
                <th scope="row" className="max-w-[16rem] pr-2 text-left font-normal">
                  <span className="block font-semibold text-base-content">
                    Ch. {ch.key} <span className="text-xs font-normal text-base-content/60">· {ch.imports.toLocaleString("en-US")} imports</span>
                  </span>
                  <span className="block truncate text-xs text-base-content/60">{chapterName(ch.key, input.sections) ?? ""}</span>
                </th>
                {cells[i].map((pct, j) => (
                  <td
                    key={programs[j].key}
                    className={`h-11 rounded-xl text-center text-xs font-semibold ${pct > 0.005 ? (pct > 14 ? "text-primary-content" : "text-base-content") : `${tt.tile} text-base-content/40`}`}
                    // Runtime tint (DESIGN_SYSTEM §10)
                    style={pct > 0.005 ? { background: heat(pct) } : undefined}
                  >
                    {pct > 0.005 ? formatRate(pct) : "·"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {more.length > 0 && <ShowAll more={more.join(" and ")} open={all} onToggle={() => setAll(!all)} />}
    </InsightPanel>
  );
};
