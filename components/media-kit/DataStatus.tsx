import type { MediaKitData } from "@/libs/media-kit/types";
import { longDate } from "./format";

// For the admin only, above the media kit: where each block's numbers come from right now, and what
// to set up for live data. Collapsed to one line so it's easy to ignore when sharing the screen.

export const DataStatus = ({ data }: { data: MediaKitData }) => {
  const { search, ai, audience, site, connections } = data;
  const rows = [
    {
      name: "Search (Google Search Console)",
      state: search.source === "live" ? `Live, through ${longDate(search.asOf)}` : `Snapshot, through ${longDate(search.asOf)}`,
      fix: connections.searchConsole
        ? search.source === "snapshot"
          ? "Connection set, but the live fetch failed (see server logs)"
          : null
        : "Set GSC_SERVICE_ACCOUNT_KEY (and GSC_SITE_URL if not sc-domain:htshero.com). Until then: npm run media-kit:snapshot -- seo-data/<folder>",
    },
    {
      name: "AI answers (Search Console AI features)",
      state: ai ? `Snapshot, through ${longDate(ai.asOf)}` : "Not available",
      fix: "Not in the Search Console API: export the AI features report into seo-data/<folder>/gen-ai and rerun the snapshot",
    },
    {
      name: "Audience (Mixpanel)",
      state: audience.source === "live" ? `Live, through ${longDate(audience.asOf)}` : `Snapshot, as of ${longDate(audience.asOf)}`,
      fix: connections.mixpanel
        ? audience.source === "snapshot"
          ? "Connection set, but the live fetch failed (see server logs)"
          : null
        : "Set MIXPANEL_SERVICE_ACCOUNT_USERNAME and MIXPANEL_SERVICE_ACCOUNT_SECRET. Until then, edit audience in libs/media-kit/snapshot.json",
    },
    {
      name: "Site (our database)",
      state: `Live: ${site.digestSubscribers ?? "?"} digest subscribers, ${site.tariffUpdates ?? "?"} news articles`,
      fix: site.digestSubscribers !== null && site.digestSubscribers < 250 ? "The subscriber count stays off the page until it reaches 250" : null,
    },
  ];
  const allLive = search.source === "live" && audience.source === "live";

  return (
    <details className="border-b border-amber-300 bg-amber-50 text-sm text-amber-950">
      <summary className="mx-auto w-full max-w-(--breakpoint-xl) cursor-pointer px-6 py-2 font-semibold lg:px-8">
        Admin only: {allLive ? "all data live" : "some numbers come from a snapshot"} · only you can see this page
      </summary>
      <div className="mx-auto w-full max-w-(--breakpoint-xl) px-6 pb-4 lg:px-8">
        <table className="w-full text-left">
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className="border-t border-amber-200 align-top">
                <th scope="row" className="py-2 pr-4 font-semibold">
                  {r.name}
                </th>
                <td className="py-2 pr-4">{r.state}</td>
                <td className="py-2 text-amber-900/80">{r.fix}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
};
