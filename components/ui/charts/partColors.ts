import { AllRules } from "@/tariffs/engine-v2/data";
import { CHART_COLORS, FEES_COLOR } from "@/components/ui/theme";
import type { Program } from "@/tariffs/engine-v2/types";

// One color per part of a duty, the same on every chart and screen (the calculator, the Tracker,
// the HTS code pages): base duty first, each tariff program by what kind of tariff it is, fees
// last. The palette has four program colors for some thirty programs, so each program has a
// fixed slot by its role, and the programs that apply to one import together (China's Section
// 301, fentanyl and reciprocal tariffs, a Section 232 on its metal) land in different slots:
//
//   slot 1: Section 301 (and 338)          trade actions against one country
//   slot 2: IEEPA reciprocal, trade deals, Section 122   the broad tariff on a country's goods
//   slot 3: IEEPA on one country (fentanyl, Brazil, India)
//   slot 4: Section 232, quotas, 201, other  tariffs on the product
//
// Only when two programs of one slot meet on the same chart does the later one (in the programs
// list's order, so it's the same every time) take the next free slot.

export const BASE_LABEL = "Base duty";
export const FEES_LABEL = "Customs fees";

const PROGRAM_SLOTS = 4;

const slotOf = (program: Program): number => {
  if (program.authority === "301" || program.authority === "338") return 1;
  if (program.id === "ieepa-reciprocal" || program.tradeDeal || program.authority === "deal" || program.authority === "122") return 2;
  if (program.authority === "IEEPA") return 3;
  return 4;
};

const byName = new Map(AllRules.programs.map((p, i) => [p.name, { program: p, order: i }]));

// The program's own slot (1 to 4), from its name as charts label it; "Other" and unknown names
// take the last
export const programSlot = (name: string) => {
  const found = byName.get(name);
  return found ? slotOf(found.program) : PROGRAM_SLOTS;
};

// A color for each label on one chart: base duty, fees, and each program in its slot
export const partColors = (labels: string[]): Record<string, string> => {
  const colors: Record<string, string> = { [BASE_LABEL]: CHART_COLORS[0], [FEES_LABEL]: FEES_COLOR };
  const programs = Array.from(new Set(labels.filter((l) => l !== BASE_LABEL && l !== FEES_LABEL))).sort(
    (a, b) => (byName.get(a)?.order ?? Infinity) - (byName.get(b)?.order ?? Infinity) || a.localeCompare(b)
  );
  const taken = new Set<number>();
  programs.forEach((label) => {
    const own = programSlot(label);
    // Its own slot, else the next free one, else (more than four programs) its own again
    const free = Array.from({ length: PROGRAM_SLOTS }, (_, i) => ((own - 1 + i) % PROGRAM_SLOTS) + 1).find((s) => !taken.has(s));
    const slot = free ?? own;
    taken.add(slot);
    colors[label] = CHART_COLORS[slot];
  });
  return colors;
};
