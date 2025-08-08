export type Metal = "Aluminum" | "Steel" | "Copper";
export type UsContent = "U.S. Content";

export enum TariffCategory {
  SECTION_232 = "Section 232",
  SECTION_301 = "Section 301",
  IEEPA = "IEEPA",
}

export type ContentRequirements = Metal | UsContent;

export interface ContentRequirement {
  content: ContentRequirements;
  minimumPercent?: number;
  maximumPercent?: number;
}

export enum TariffColumn {
  GENERAL = "general",
  SPECIAL = "special",
  OTHER = "other",
}
