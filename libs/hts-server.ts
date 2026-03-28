import { createServerClient } from "@supabase/ssr";
import { decompressHtsRevisionPayload } from "./hts-decompress";
import { readFile } from "fs/promises";
import path from "path";
import { HtsElement, HtsSection } from "../interfaces/hts";
import { getSectionAndChapterForElement as getSectionAndChapterForElementImpl } from "./hts-section-chapter";
import { SupabaseBuckets, SupabaseTables } from "../constants/supabase";
import { HtsRevision } from "./supabase/hts-revision";

const createAdminClient = () => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
    }
  );
};

let cachedElements: HtsElement[] | null = null;
let cachedSections: HtsSection[] | null = null;

export async function getHtsElementsServer(): Promise<HtsElement[]> {
  if (cachedElements) return cachedElements;

  const supabase = createAdminClient();

  const { data: revisionInstance, error: revError } = await supabase
    .from(SupabaseTables.HTS_REVISIONS)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .single<HtsRevision>();

  if (revError) {
    throw new Error(`Failed to get latest HTS revision: ${revError.message}`);
  }

  const { data: blob, error: dlError } = await supabase.storage
    .from(SupabaseBuckets.HTS_REVISIONS)
    .download(`${revisionInstance.name}.json.gz`);

  if (dlError) {
    throw new Error(`Failed to download HTS data: ${dlError.message}`);
  }

  const arrayBuffer = await blob.arrayBuffer();
  const decompressed = decompressHtsRevisionPayload(
    new Uint8Array(arrayBuffer)
  );
  cachedElements = JSON.parse(decompressed) as HtsElement[];

  return cachedElements;
}

export async function getHtsSectionsServer(): Promise<HtsSection[]> {
  if (cachedSections) return cachedSections;

  const filePath = path.join(process.cwd(), "sections-and-chapters.json");
  const raw = await readFile(filePath, "utf8");
  const parsed = JSON.parse(raw) as { sections: HtsSection[] };
  cachedSections = parsed.sections;

  return cachedSections;
}

export function getHtsElementByCode(
  code: string,
  elements: HtsElement[]
): HtsElement | undefined {
  return elements.find((el) => el.htsno === code);
}

export function getHtsElementParentsServer(
  element: HtsElement,
  elements: HtsElement[]
): HtsElement[] {
  if (element.indent === "0") return [];

  const elementIndex = elements.findIndex((e) => e.uuid === element.uuid);

  for (let i = elementIndex - 1; i >= 0; i--) {
    if (elements[i].indent === String(Number(element.indent) - 1)) {
      return [...getHtsElementParentsServer(elements[i], elements), elements[i]];
    }
  }

  return [];
}

export const getSectionAndChapterForElement = getSectionAndChapterForElementImpl;
