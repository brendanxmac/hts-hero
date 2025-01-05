import { HtsLevel } from "../enums/hts";

export interface HtsWithParentReference extends HtsElement {
  indexInParentArray: number; // used to grab window ranges in the parent array
}

export interface HtsElement {
  htsno: string;
  indent: string;
  description: string;
  superior: string | null;
  units: string[];
  general: string | null;
  special: string | null;
  other: string | null;
  footnotes: Footnote[];
  quotaQuantity: string | null;
  additionalDuties: string | null;
  addiitionalDuties: string | null;
}

export interface Footnote {
  columns: string[];
  value: string;
  type: string;
}

export interface HsHeading {
  heading: string;
  description: string;
  logic: string;
}

export interface MatchResponse {
  index: string;
  logic: string;
}

export interface HtsLevelClassification {
  level: HtsLevel;
  candidates: HtsElement[];
  selection: HtsElement;
  reasoning: string;
}

export interface TemporaryTariff {
  description: string;
  element?: HtsElement;
}
