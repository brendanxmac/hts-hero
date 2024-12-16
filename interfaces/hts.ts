export interface HtsWithParentReference extends HtsRaw {
  indexInParentArray: number; // used to grab window ranges in the parent array
}

export interface HtsRaw {
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

export interface HtsEmbedding extends HtsParsed {
  embedding: number[];
}

export interface HtsParsed {
  code: string;
  description: string;
}

export interface HsHeading {
  heading: string;
  description: string;
  logic: string;
}

export interface UsHtsItem {
  code: string;
  logic: string;
}

export interface MatchResponse {
  description: string;
  logic: string;
}

export interface HtsLayerSelection {
  element: HtsRaw;
  logic: string;
}
