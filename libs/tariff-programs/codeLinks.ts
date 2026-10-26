import type { HtsElement } from "@/interfaces/hts";
import { getHtsElementsServer } from "@/libs/hts-server";
import { htsProductName } from "@/libs/hts-duty-summary";
import { resolveHtsLinks } from "@/libs/tariff-updates/public";

// Where each listed code links on the site and its readable name, for pages that list hundreds or
// thousands of codes at once. A listed code can exist only as its 10-digit line or under a renamed
// parent, so links go through resolveHtsLinks (never a 404); names come from one pass over the HTS
// instead of a parent lookup per code.

export type CodeInfo = { href: string | null; name?: string };

// Every line's parents, from one pass over the schedule in order
const parentsByUuid = (elements: HtsElement[]) => {
  const map = new Map<string, HtsElement[]>();
  const stack: HtsElement[] = [];
  for (const el of elements) {
    const indent = Number(el.indent);
    while (stack.length > 0 && Number(stack[stack.length - 1].indent) >= indent) stack.pop();
    map.set(el.uuid, [...stack]);
    stack.push(el);
  }
  return map;
};

export const codeInfoFor = async (codes: string[], withNames = true): Promise<Record<string, CodeInfo>> => {
  const links = await resolveHtsLinks(codes);
  if (!withNames) return Object.fromEntries(codes.map((c) => [c, { href: links[c] ?? null }]));
  const elements = await getHtsElementsServer();
  const byHtsno = new Map(elements.map((el) => [el.htsno, el]));
  const parents = parentsByUuid(elements);
  return Object.fromEntries(
    codes.map((code) => {
      const href = links[code] ?? null;
      const target = byHtsno.get(href?.replace(/^\/hts\//, "") ?? "");
      return [code, { href, name: target ? htsProductName(target, parents.get(target.uuid) ?? [], 90) : undefined }];
    })
  );
};
