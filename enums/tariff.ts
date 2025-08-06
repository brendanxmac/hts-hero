export type Metal = "Aluminum" | "Steel" | "Copper";

export enum TariffCategory {
  SECTION_232 = "Section 232",
  SECTION_301 = "Section 301",
  IEEPA = "IEEPA",
}

export type ContentRequirement = Metal;

export enum TariffColumn {
  GENERAL = "general",
  SPECIAL = "special",
  OTHER = "other",
}
