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
  exceptionCodes: Set<string>;
  tariffs: UITariff[];
}
