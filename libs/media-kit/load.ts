import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/app/api/supabase/server";
import { COUNTRY_PAGES } from "@/libs/country-pages/countries";
import { PROGRAM_HUBS } from "@/libs/tariff-programs/hubs";
import { fetchSearchConsole, searchConsoleConfigured } from "./gsc";
import { fetchMixpanel, mixpanelConfigured } from "./mixpanel";
import snapshotJson from "./snapshot.json";
import type { MediaKitData, MediaKitSnapshot, SiteStats } from "./types";

// Everything the media kit shows: live where a connection is set up, the snapshot otherwise (and
// when a live fetch fails, so the page always renders). Cached for 6 hours; the APIs are slow and
// these numbers move daily at most.

const snapshot = snapshotJson as unknown as MediaKitSnapshot;
const SIX_HOURS = 6 * 60 * 60;

// HTS code pages in the sitemap: every line of the current HTS (next-sitemap.config.js lists them
// from the latest revision). Rounded down; it changes only with a new HTS revision.
const HTS_PAGES = 27_000;

const live = <T>(name: string, fetcher: () => Promise<T | null>) =>
  unstable_cache(
    async () => {
      try {
        return await fetcher();
      } catch (e) {
        console.error(`Media kit: ${name} failed, using the snapshot`, e);
        return null;
      }
    },
    ["media-kit", name, "v1"],
    { revalidate: SIX_HOURS }
  );

const searchLive = live("search-console", fetchSearchConsole);
const audienceLive = live("mixpanel", fetchMixpanel);

const siteStats = unstable_cache(
  async (): Promise<SiteStats> => {
    const db = createAdminClient();
    const [updates, subscribers] = await Promise.all([
      db.from("tariff_updates").select("id", { count: "exact", head: true }).eq("status", "published"),
      db.from("email_subscribers").select("id", { count: "exact", head: true }).not("confirmed_at", "is", null).is("unsubscribed_at", null),
    ]);
    return {
      countryPages: COUNTRY_PAGES.length,
      // The program hubs plus the Section 301 exclusions page
      programHubs: PROGRAM_HUBS.length + 1,
      htsPages: HTS_PAGES,
      tariffUpdates: updates.error ? null : updates.count,
      digestSubscribers: subscribers.error ? null : subscribers.count,
    };
  },
  ["media-kit", "site", "v1"],
  { revalidate: SIX_HOURS }
);

export const loadMediaKit = async (): Promise<MediaKitData> => {
  const [search, audience, site] = await Promise.all([searchLive(), audienceLive(), siteStats()]);
  return {
    search: search ?? snapshot.search,
    ai: snapshot.ai,
    audience: audience ?? snapshot.audience,
    site,
    connections: { searchConsole: searchConsoleConfigured(), mixpanel: mixpanelConfigured() },
    generatedAt: new Date().toISOString(),
  };
};
