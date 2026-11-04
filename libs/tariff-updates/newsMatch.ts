// Whether a tariff update is news for someone's laws and countries (empty: all). Shared by the news
// emails (libs/email/news-producer.ts) and Duty Guard's Tariff Updates list, so the list shows what
// the emails send. An all-countries update matches every country; one naming no country only
// matches with no country picked. AD/CVD news (many notices a week) only when picked.
export const matchesNews = (u: { authority: string; countries: string[] }, p: { authorities: string[]; countries: string[] }) =>
  (u.authority === "ad_cvd" ? p.authorities.includes("ad_cvd") : !p.authorities.length || p.authorities.includes(u.authority)) &&
  (!p.countries.length || u.countries.includes("ALL") || u.countries.some((c) => p.countries.includes(c)))
