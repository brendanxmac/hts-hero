import { SectionSlug } from "../sections";

// The sections the user has opened on this device, for the Overview's setup steps

const SEEN_KEY = "hts-hero-tariff-tracker-seen-sections";

export const readSet = (key: string) => {
  try {
    return new Set<string>(JSON.parse(window.localStorage.getItem(key) ?? "[]"));
  } catch {
    return new Set<string>();
  }
};

export const readSeenSections = () => readSet(SEEN_KEY);

export const rememberSection = (slug: SectionSlug) => {
  try {
    const seen = readSet(SEEN_KEY);
    if (seen.has(slug)) return;
    seen.add(slug);
    window.localStorage.setItem(SEEN_KEY, JSON.stringify(Array.from(seen)));
  } catch {
    // Not critical
  }
};
