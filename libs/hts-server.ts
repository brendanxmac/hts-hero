import { createServerClient } from "@supabase/ssr";
import { createHash } from "crypto";
import { get } from "https";
import { gunzipSync, inflateSync } from "zlib";
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
        getAll(): { name: string; value: string }[] {
          return [];
        },
        setAll() {},
      },
    }
  );
};

let cachedElements: HtsElement[] | null = null;
let cachedRevisionName: string | null = null;
let cachedSections: HtsSection[] | null = null;

// One load at a time: pages asking at once share it
let loadingElements: Promise<HtsElement[]> | null = null;

export async function getHtsElementsServer(): Promise<HtsElement[]> {
  if (cachedElements) return cachedElements;
  loadingElements ??= loadElements().finally(() => {
    loadingElements = null;
  });
  return loadingElements;
}

async function loadElements(): Promise<HtsElement[]> {
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

  cachedElements = await downloadElements(revisionInstance.name);
  cachedRevisionName = revisionInstance.name;

  return cachedElements;
}

// Node's own zlib on the server (pako stays for the browser, libs/hts-decompress.ts): gzip from
// `gzip`, or the older zlib-wrapped files
const decompressOnServer = (bytes: Uint8Array) =>
  (bytes[0] === 0x1f && bytes[1] === 0x8b ? gunzipSync(bytes) : inflateSync(bytes)).toString("utf8");

// The revision file comes straight from Supabase Storage over Node's https, not fetch: Next keeps
// fetch responses in its cache (.next/cache, which Vercel carries between builds), and one bad copy
// there (2026-10-21: the right length, the wrong bytes) failed every build after it. Each server
// downloads it once; a download that doesn't read is tried again.
const DOWNLOAD_ATTEMPTS = 3;

const downloadFile = (url: string, key: string) =>
  new Promise<Uint8Array>((resolve, reject) => {
    const req = get(url, { headers: { Authorization: `Bearer ${key}`, apikey: key } }, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk: Buffer) => chunks.push(chunk));
      res.on("error", reject);
      res.on("end", () => {
        const body = Buffer.concat(chunks);
        if (res.statusCode !== 200) {
          reject(new Error(`Failed to download HTS data: ${res.statusCode} ${body.toString("utf8").slice(0, 200)}`));
        } else {
          resolve(new Uint8Array(body));
        }
      });
    });
    req.on("error", reject);
    req.setTimeout(60_000, () => req.destroy(new Error("Failed to download HTS data: timed out")));
  });

async function downloadElements(revisionName: string): Promise<HtsElement[]> {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${SupabaseBuckets.HTS_REVISIONS}/${encodeURIComponent(`${revisionName}.json.gz`)}`;
  for (let attempt = 1; ; attempt++) {
    try {
      const bytes = await downloadFile(url, process.env.SUPABASE_SERVICE_ROLE_KEY!);
      try {
        return JSON.parse(decompressOnServer(bytes)) as HtsElement[];
      } catch (e) {
        const sha = createHash("sha256").update(bytes).digest("hex").slice(0, 16);
        throw new Error(
          `Reading HTS data ${revisionName} (${bytes.length} bytes, sha256 ${sha}): ${e instanceof Error ? e.message : e}`
        );
      }
    } catch (e) {
      if (attempt >= DOWNLOAD_ATTEMPTS) throw e;
      await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
    }
  }
}

// The HTS revision the server's elements (and so their base rates) come from: "2026HTSRev20"
export async function getHtsRevisionNameServer(): Promise<string> {
  await getHtsElementsServer();
  return cachedRevisionName ?? "unknown";
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
