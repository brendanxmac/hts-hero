import { AllRules } from "@/tariffs/engine-v2/data";

// The /tariffs/[slug] program pages: one per tariff program (or family of programs), each listing
// every Chapter 99 heading and every HTS code it covers, from the engine's data. A Chapter 99 page
// links to its program's page through `hubForProgram`.

export interface ProgramHub {
  slug: string;
  // "Section 232 Tariffs on Steel, Aluminum & Copper"
  title: string;
  // "Section 232 steel, aluminum and copper tariffs", for sentences
  short: string;
  // The engine programs the page covers
  programs: string[];
  // The law behind it, in one sentence. Facts about the statute only; everything about rates,
  // dates and coverage comes from the data.
  law: string;
  // The one country the program charges, as an ISO code: the calculator link opens on it
  country?: string;
}

const SECTION_232 =
  "Section 232 of the Trade Expansion Act of 1962 lets the President adjust imports of goods that threaten to impair US national security, after a Commerce Department investigation.";
const SECTION_301 =
  "Section 301 of the Trade Act of 1974 lets the US Trade Representative act against a country's unfair or unreasonable trade practices, including with additional duties.";

export const PROGRAM_HUBS: ProgramHub[] = [
  {
    slug: "section-232-steel-aluminum-copper",
    title: "Section 232 Tariffs on Steel, Aluminum & Copper",
    short: "Section 232 steel, aluminum and copper tariffs",
    programs: ["232-metals"],
    law: SECTION_232,
  },
  {
    slug: "section-232-autos-auto-parts",
    title: "Section 232 Tariffs on Autos & Auto Parts",
    short: "Section 232 auto and auto parts tariffs",
    programs: ["232-autos"],
    law: SECTION_232,
  },
  {
    slug: "section-232-timber-lumber-furniture",
    title: "Section 232 Tariffs on Timber, Lumber & Wood Products",
    short: "Section 232 timber, lumber and wood products tariffs",
    programs: ["232-wood"],
    law: SECTION_232,
  },
  {
    slug: "section-232-trucks-buses",
    title: "Section 232 Tariffs on Medium & Heavy-Duty Trucks and Buses",
    short: "Section 232 truck and bus tariffs",
    programs: ["232-mhdv"],
    law: SECTION_232,
  },
  {
    slug: "section-232-semiconductors",
    title: "Section 232 Tariffs on Semiconductors",
    short: "Section 232 semiconductor tariffs",
    programs: ["232-semiconductors"],
    law: SECTION_232,
  },
  {
    slug: "section-232-pharmaceuticals",
    title: "Section 232 Tariffs on Pharmaceuticals",
    short: "Section 232 pharmaceutical tariffs",
    programs: ["232-pharmaceuticals"],
    law: SECTION_232,
  },
  {
    slug: "section-232-drones",
    title: "Section 232 Tariffs on Drones (Unmanned Aircraft Systems)",
    short: "Section 232 drone tariffs",
    programs: ["232-uas"],
    law: SECTION_232,
  },
  {
    slug: "section-301-china",
    title: "Section 301 Tariffs on China: Lists 1, 2, 3 and 4A",
    short: "Section 301 tariffs on China",
    programs: ["301-china"],
    law: SECTION_301,
    country: "CN",
  },
  {
    slug: "section-301-forced-labor",
    title: "Section 301 Forced Labor Tariffs by Country",
    short: "Section 301 forced labor tariffs",
    programs: ["301-forced-labor"],
    law: SECTION_301,
  },
  {
    slug: "section-301-brazil",
    title: "Section 301 Tariffs on Brazil",
    short: "Section 301 tariffs on Brazil",
    programs: ["301-brazil"],
    law: SECTION_301,
    country: "BR",
  },
  {
    slug: "section-338-canada",
    title: "Section 338 Tariffs on Canada",
    short: "Section 338 tariffs on Canada",
    programs: ["338-canada"],
    law: "Section 338 of the Tariff Act of 1930 lets the President impose additional duties on goods from a country that discriminates against US commerce.",
    country: "CA",
  },
  {
    slug: "section-122",
    title: "Section 122 Import Surcharge",
    // Plural like the others: every sentence about a program reads "the {short} are"
    short: "Section 122 tariffs",
    programs: ["122"],
    law: "Section 122 of the Trade Act of 1974 lets the President impose a temporary import surcharge of up to 15%, for up to 150 days, to deal with large and serious balance-of-payments deficits.",
  },
  {
    slug: "section-201-quartz",
    title: "Section 201 Safeguard Tariffs on Quartz Surface Products",
    short: "Section 201 quartz safeguard tariffs",
    programs: ["201-quartz"],
    law: "Section 201 of the Trade Act of 1974 lets the President impose temporary safeguard duties when rising imports seriously injure a US industry, after a US International Trade Commission investigation.",
  },
  {
    slug: "ieepa",
    title: "IEEPA Tariffs: Reciprocal, Fentanyl and Country Tariffs",
    short: "IEEPA tariffs",
    programs: AllRules.programs.filter((p) => p.authority === "IEEPA").map((p) => p.id),
    law: "The International Emergency Economic Powers Act (IEEPA) was the basis for the reciprocal, fentanyl and other country tariffs from February 2025 until the Supreme Court held on February 20, 2026 that it does not authorize tariffs.",
  },
];

export const hubBySlug = (slug: string) => PROGRAM_HUBS.find((h) => h.slug === slug);

export const hubForProgram = (programId: string) => PROGRAM_HUBS.find((h) => h.programs.includes(programId)) ?? null;

export const hubPath = (hub: ProgramHub) => `/tariffs/${hub.slug}`;
