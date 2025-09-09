import { ContentRequirement, TariffCategory } from "../enums/tariff";

export interface TariffI {
  code: string;
  description: string;
  name: string;
  exceptions?: string[];
  inclusions?: {
    tariffs?: string[];
    codes?: string[];
    countries?: string[];
  };
  exclusions?: {
    tariffs?: string[];
    codes?: string[];
    countries?: string[];
  };
  general?: number;
  special?: number;
  other?: number;
  unit?: string;
  requiresReview?: boolean;
  contentRequirement?: ContentRequirement;
  category?: TariffCategory; // TODO: implement this
}

export interface UITariff extends TariffI {
  isActive: boolean;
}

export interface TariffSet {
  name: string;
  exceptionCodes: Set<string>;
  tariffs: UITariff[];
}

export interface TariffImpactCheck {
  id: string; // uuid
  user_id: string; // uuid
  tariff_code_set: string; // uuid
  hts_code_set?: string; // uuid
  codes: string[]; // stored as jsonb
  num_codes: number; // generated column
  created_at: string; // ISO timestamp
}

export type NewTariffImpactCheck = Omit<
  TariffImpactCheck,
  "id" | "num_codes" | "created_at"
>;
