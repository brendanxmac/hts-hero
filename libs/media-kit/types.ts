// The numbers on the media kit (/media-kit): what a sponsor, affiliate or partner needs to judge
// whether HTS Hero's audience is worth paying for. Each block says where it came from: fetched
// live (Search Console API, Mixpanel API, our database) or read from the dated snapshot
// (libs/media-kit/snapshot.json) while a live connection isn't set up.

export type DataSource = "live" | "snapshot";

export interface Sourced {
  source: DataSource;
  // The last day the numbers cover (YYYY-MM-DD)
  asOf: string;
}

export interface SearchWeek {
  // Monday of the week (YYYY-MM-DD)
  week: string;
  clicks: number;
  impressions: number;
  // Fewer than 7 days of data so far
  partial?: boolean;
}

export interface Totals {
  clicks: number;
  impressions: number;
  // Clicks / impressions, 0–1
  ctr: number;
  // Average position
  position: number;
}

export interface Row {
  label: string;
  clicks: number;
  impressions: number;
  position?: number;
}

export interface SearchStats extends Sourced {
  weekly: SearchWeek[];
  last28: Totals;
  prev28: Totals | null;
  // Searches that aren't for our name, most clicked first
  topQueries: Row[];
  // Clicks by kind of page (country calculators, HTS code pages…)
  pageGroups: Row[];
  topPages: Row[];
  countries: Row[];
  devices: Row[];
  // The period the queries, pages, countries and devices cover ("the last 28 days")
  breakdownPeriod: string;
  // The snapshot's page list stops at 1,000 rows, so its groups undercount the long tail
  pagesCapped?: boolean;
}

export interface AiWeek {
  week: string;
  impressions: number;
  partial?: boolean;
}

export interface AiStats extends Sourced {
  // Google AI Overview / AI Mode impressions (Search Console's AI features report)
  weekly: AiWeek[];
}

export interface AudienceWeek {
  week: string;
  // Unique visitors that week
  visitors: number;
  pageViews: number;
  // Duty Calculator results shown
  calculatorResults: number;
  partial?: boolean;
}

export interface AudienceStats extends Sourced {
  // From the week bot traffic was filtered out of Mixpanel (2026-11-02)
  weekly: AudienceWeek[];
  // Share of visitors (or page views, live) by country, largest first
  countries: { label: string; share: number }[];
  // What `countries` counts
  countryBasis: "visitors" | "page views";
}

export interface SiteStats {
  countryPages: number;
  programHubs: number;
  htsPages: number;
  // Published /tariff-updates pages
  tariffUpdates: number | null;
  // Confirmed, still-subscribed Tariff Digest readers
  digestSubscribers: number | null;
}

export interface MediaKitData {
  search: SearchStats;
  ai: AiStats | null;
  audience: AudienceStats;
  site: SiteStats;
  // Which live connections are set up (shown to the admin, never in the pitch)
  connections: { searchConsole: boolean; mixpanel: boolean };
  generatedAt: string;
}

// The part of the data kept in snapshot.json
export interface MediaKitSnapshot {
  search: SearchStats;
  ai: AiStats | null;
  audience: AudienceStats;
}
