import { createSign } from "crypto";
import { groupRows, isBrandQuery, pageGroup, pathOf, shiftDay, toWeeks, totalsBetween } from "./shape";
import type { Row, SearchStats } from "./types";

// Search Console, live, for the media kit. Server only. Needs a Google Cloud service account with
// the Search Console API enabled, added as a (restricted) user on the htshero.com property:
//   GSC_SERVICE_ACCOUNT_KEY  the service account's JSON key, as is or base64-encoded
//   GSC_SITE_URL             the property, "sc-domain:htshero.com" (default) or "https://htshero.com/"
// Without them the media kit uses the snapshot.

const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";

interface ServiceAccount {
  client_email: string;
  private_key: string;
}

const serviceAccount = (): ServiceAccount | null => {
  const raw = process.env.GSC_SERVICE_ACCOUNT_KEY?.trim();
  if (!raw) return null;
  try {
    return JSON.parse(raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8"));
  } catch {
    console.error("GSC_SERVICE_ACCOUNT_KEY isn't valid JSON or base64 JSON");
    return null;
  }
};

export const searchConsoleConfigured = () => serviceAccount() !== null;

const base64url = (s: string | Buffer) => Buffer.from(s).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");

// An access token for the service account (signed JWT exchanged at Google's token endpoint)
const accessToken = async (account: ServiceAccount) => {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({ iss: account.client_email, scope: SCOPE, aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 })
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const jwt = `${header}.${claims}.${base64url(signer.sign(account.private_key))}`;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Google token request failed: ${res.status} ${await res.text()}`);
  return ((await res.json()) as { access_token: string }).access_token;
};

interface ApiRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

const today = () => new Date().toISOString().slice(0, 10);

export const fetchSearchConsole = async (): Promise<SearchStats | null> => {
  const account = serviceAccount();
  if (!account) return null;
  const token = await accessToken(account);
  const site = encodeURIComponent(process.env.GSC_SITE_URL || "sc-domain:htshero.com");

  const query = async (body: Record<string, unknown>): Promise<ApiRow[]> => {
    const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${site}/searchAnalytics/query`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ type: "web", dataState: "final", ...body }),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Search Console query failed: ${res.status} ${await res.text()}`);
    return ((await res.json()) as { rows?: ApiRow[] }).rows ?? [];
  };

  // Daily data for 16 weeks, to find the last day Search Console has
  const dayRows = await query({ startDate: shiftDay(today(), -115), endDate: today(), dimensions: ["date"], rowLimit: 500 });
  const days = dayRows.map((r) => ({ date: r.keys[0], clicks: r.clicks, impressions: r.impressions, position: r.position }));
  if (days.length === 0) return null;
  const asOf = days[days.length - 1].date;
  const range = { startDate: shiftDay(asOf, -27), endDate: asOf };

  const toRows = (rows: ApiRow[]): Row[] => rows.map((r) => ({ label: r.keys[0], clicks: r.clicks, impressions: r.impressions, position: r.position }));
  const [queries, pages, countries, devices] = await Promise.all([
    query({ ...range, dimensions: ["query"], rowLimit: 200 }),
    query({ ...range, dimensions: ["page"], rowLimit: 25000 }),
    query({ ...range, dimensions: ["country"], rowLimit: 12 }),
    query({ ...range, dimensions: ["device"], rowLimit: 5 }),
  ]);

  const countryName = new Intl.DisplayNames(["en"], { type: "region" });
  const pageRows = toRows(pages);
  return {
    source: "live",
    asOf,
    weekly: toWeeks(days),
    last28: totalsBetween(days, range.startDate, asOf),
    prev28: totalsBetween(days, shiftDay(asOf, -55), shiftDay(asOf, -28)),
    breakdownPeriod: "the last 28 days",
    topQueries: toRows(queries).filter((q) => !isBrandQuery(q.label)).slice(0, 25),
    pageGroups: groupRows(pageRows, pageGroup),
    topPages: pageRows.slice(0, 15).map((p) => ({ ...p, label: pathOf(p.label) })),
    // The API gives ISO 3166 alpha-3 codes ("usa")
    countries: toRows(countries).map((c) => ({ ...c, label: regionName(countryName, c.label) })),
    devices: toRows(devices).map((d) => ({ ...d, label: d.label.charAt(0) + d.label.slice(1).toLowerCase() })),
  };
};

// Alpha-3 to a country name, through the alpha-2 code Intl understands
const ALPHA3: Record<string, string> = {
  usa: "US", can: "CA", ind: "IN", gbr: "GB", twn: "TW", mex: "MX", aus: "AU", kor: "KR", nld: "NL", ita: "IT", mys: "MY",
  deu: "DE", fra: "FR", chn: "CN", jpn: "JP", vnm: "VN", bra: "BR", esp: "ES", phl: "PH", idn: "ID", tha: "TH", sgp: "SG",
  pak: "PK", bgd: "BD", tur: "TR", isr: "IL", che: "CH", irl: "IE", nzl: "NZ", zaf: "ZA", are: "AE", sau: "SA", col: "CO",
  chl: "CL", per: "PE", arg: "AR", hkg: "HK", pol: "PL", swe: "SE", bel: "BE", khm: "KH", egy: "EG", nga: "NG", ken: "KE",
};

const regionName = (names: Intl.DisplayNames, alpha3: string) => {
  const alpha2 = ALPHA3[alpha3.toLowerCase()];
  return (alpha2 && names.of(alpha2)) || alpha3.toUpperCase();
};
