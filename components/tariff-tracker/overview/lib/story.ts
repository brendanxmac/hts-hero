import { shortDate } from "../../../duty-calculator/rate-history/format";
import { addDays } from "../../../../tariffs/engine-v2/history";
import { getLatestVerifiedRevision, getVerifiedRevisions } from "../../../../tariffs/engine-v2/revisions";
import { IsoDate } from "../../../../tariffs/engine-v2/types";
import { formatRate } from "../../formatRate";
import { CatalogChange } from "../../insights/catalogHistory";
import { wholeDollars } from "../../insights/teasers";

// The Overview's rotating line (DESIGN_SYSTEM.md §15): a sentence about the user's own catalog,
// its numbers in colored chips. Only framings that are true right now, most relevant first:
// something just changed, the cost of waiting, what we've done since they joined, all clear.
// Savings are always potential ("could", "up to").

export type StoryTone = "primary" | "success" | "error";
export type StoryPart = string | { text: string; tone: StoryTone };

export interface Story {
  id: "changed" | "waiting" | "joined" | "clear";
  kind: string;
  tone: StoryTone;
  parts: StoryPart[];
}

const plural = (n: number, one: string, many: string) => `${n.toLocaleString("en-US")} ${n === 1 ? one : many}`;

export const buildStories = ({
  today,
  products,
  dutyUsd,
  potentialUsd,
  changes,
  joinedAt,
}: {
  today: IsoDate;
  products: number;
  dutyUsd: number;
  // Null while savings are still being worked out
  potentialUsd: number | null;
  changes: CatalogChange[];
  // The account's creation date; null when signed out
  joinedAt: IsoDate | null;
}): Story[] => {
  const stories: Story[] = [];
  const monthAgo = addDays(today, -30);
  const recent = changes.filter((c) => c.date > monthAgo && c.date <= today);
  if (recent.length) {
    const latest = recent[0];
    const hit = new Set(recent.filter((c) => c.date === latest.date).map((c) => c.product.key)).size;
    const up = latest.deltaPct > 0;
    stories.push({
      id: "changed",
      kind: "Just changed",
      tone: "error",
      parts: [
        `On ${shortDate(latest.date)}, tariffs changed on `,
        { text: plural(hit, "of your products", "of your products"), tone: "error" },
        `. ${latest.product.entry.element.htsno} from ${latest.product.entry.country.name} went ${up ? "up" : "down"} `,
        { text: `${formatRate(Math.abs(latest.deltaPct))} points`, tone: up ? "error" : "success" },
        ".",
      ],
    });
  }
  if (potentialUsd !== null && potentialUsd > 0) {
    stories.push({
      id: "waiting",
      kind: "Your cost of waiting",
      tone: "success",
      parts: [
        "Each shipment at today's rates costs ",
        { text: wholeDollars(dutyUsd), tone: "primary" },
        " in duty. You could potentially save up to ",
        { text: wholeDollars(potentialUsd), tone: "success" },
        " of it.",
      ],
    });
  }
  if (joinedAt) {
    const days = Math.max(1, Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${joinedAt}T00:00:00Z`)) / 86400000));
    const revisions = getVerifiedRevisions().filter((r) => r.from >= joinedAt).length;
    const caught = changes.filter((c) => c.date >= joinedAt).length;
    stories.push({
      id: "joined",
      kind: "Since you joined",
      tone: "primary",
      parts: [
        `In ${plural(days, "day", "days")} we've checked `,
        { text: plural(products, "product", "products"), tone: "primary" },
        ` against ${plural(Math.max(revisions, 1), "HTS update", "HTS updates")}, caught `,
        { text: plural(caught, "change", "changes"), tone: caught ? "error" : "primary" },
        ...(potentialUsd ? [" and spotted up to ", { text: wholeDollars(potentialUsd), tone: "success" as const }, " in potential savings."] : ["."]),
      ],
    });
  }
  const weekAgo = addDays(today, -7);
  if (!changes.some((c) => c.date > weekAgo && c.date <= today)) {
    stories.push({
      id: "clear",
      kind: "All clear",
      tone: "success",
      parts: [
        "Nothing changed on your ",
        { text: plural(products, "product", "products"), tone: "primary" },
        " this week. We checked every one against ",
        { text: getLatestVerifiedRevision().title, tone: "primary" },
        ".",
      ],
    });
  }
  return stories;
};
