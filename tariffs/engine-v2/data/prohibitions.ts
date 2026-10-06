// Import bans. See the Prohibition type in ../types.ts: a ban never changes the duty, it says
// the goods can't be entered at all.

import { Prohibition } from "../types"

// Section 338 – Canada: Proclamations 11061, 11062 and 11063 (signed Sep 8, 2026; 91 FR, Sep 14,
// 2026) exclude the products in their annexes from importation from 12:01 a.m. ET on September
// 29, 2026. Goods imported before then (including into a bonded warehouse or FTZ) can still be
// entered and pay the 50% duty under 9903.03.12–.14, which is why those headings keep running.
// CBP rejects entries of covered products from that date (CSMS #70050970).
const FROM = "2026-09-29"
const CSMS = { citation: "CSMS # 70050970", url: "https://content.govdelivery.com/accounts/USDHSCBP/bulletins/42ce49a" }
const AFTER = "They can't be entered from September 29, 2026, and CBP rejects entries that include them. Goods imported before then, including into a bonded warehouse or foreign-trade zone, can still be entered and pay the 50% Section 338 duty."

export const prohibitions: Prohibition[] = [
  {
    id: "ban:canada-338-alcohol",
    program: "338-canada",
    name: "Section 338 import ban: Canadian alcoholic beverages",
    description: `Certain alcoholic beverages of Canada are excluded from importation under Proclamation 11061. ${AFTER}`,
    scope: { countries: ["CA"], codes: [{ list: "canada338BanAlcohol" }] },
    effective: { from: FROM },
    source: { ...CSMS, citation: `Proclamation 11061, ${CSMS.citation}` },
  },
  {
    id: "ban:canada-338-alcohol-packaged",
    program: "338-canada",
    name: "Section 338 import ban: Canadian alcoholic beverages (packaged)",
    description: `Alcoholic beverages of Canada under these provisions are excluded from importation under Proclamation 11061 when packaged in bottles, cans, boxes, kegs or other similar direct-to-consumption containers. Bulk shipments aren't banned. ${AFTER}`,
    scope: { countries: ["CA"], codes: [{ list: "canada338BanAlcoholPackaged" }] },
    unless: [{ kind: "answer", input: "alcoholInBulk", equals: true }],
    effective: { from: FROM },
    source: { ...CSMS, citation: `Proclamation 11061, ${CSMS.citation}` },
  },
  {
    id: "ban:canada-338-dairy",
    program: "338-canada",
    name: "Section 338 import ban: Canadian dairy and related products",
    description: `Certain dairy and related products of Canada (whey, molasses and non-alcoholic beer) are excluded from importation under Proclamation 11062. ${AFTER}`,
    scope: { countries: ["CA"], codes: [{ list: "canada338BanDairy" }] },
    effective: { from: FROM },
    source: { ...CSMS, citation: `Proclamation 11062, ${CSMS.citation}` },
  },
  {
    id: "ban:canada-338-motor-vehicles",
    program: "338-canada",
    name: "Section 338 import ban: Canadian motorcycles over 800 cc",
    description: `Motorcycles of Canada with an engine over 800 cc are excluded from importation under Proclamation 11063. ${AFTER}`,
    scope: { countries: ["CA"], codes: [{ list: "canada338BanMotorVehicles" }] },
    effective: { from: FROM },
    source: { ...CSMS, citation: `Proclamation 11063, ${CSMS.citation}` },
  },
]
