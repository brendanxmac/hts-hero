import { HtsLevel } from "../enums/hts";

export interface HtsSection extends HtsSectionAndChapterBase {
  chapters: HtsSectionAndChapterBase[];
}

export interface HtsSectionAndChapterBase {
  number: number;
  description: string;
}

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
  section: string;
  description: string;
  logic: string;
}

export interface BetterMatchResponse {
  bestCandidates: string[];
  logic: string;
}

export interface MatchResponse {
  index: number;
  logic: string;
}

export interface HtsLevelClassification {
  level: HtsLevel;
  candidates: HtsElement[] | HtsSectionAndChapterBase[];
  selection: HtsElement | HtsSectionAndChapterBase;
  reasoning: string;
}

export interface TemporaryTariff {
  description: string;
  element?: HtsElement;
}
