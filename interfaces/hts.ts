import { NavigatableElementType } from "../components/Elements";
import { HtsLevel } from "../enums/hts";

export interface Eval {
  index: number;
  content: string;
  reasoning: string;
}

export interface Note {
  path: string;
  content: string;
  type: string;
  section: string;
  listPosition: string;
}

export enum Navigatable {
  SECTIONS = "sections",
  CHAPTER = "chapter",
  ELEMENT = "element",
}

export interface HtsSection extends HtsSectionAndChapterBase {
  chapters: HtsSectionAndChapterBase[];
}

export interface HtsSectionAndChapterBase {
  number: number;
  description: string;
  notesPath?: string;
  type: Navigatable.CHAPTER;
}

export interface HtsElementWithParentReference extends HtsElement {
  indexInParentArray: number; // used to grab window ranges in the parent array
}

export interface SimplifiedHtsElement {
  code: string;
  description: string;
}

export interface HtsElement {
  uuid: string;
  type: Navigatable.ELEMENT;
  chapter: number;
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
  recommended?: boolean;
  recommendedReason?: string;
  notes?: string;
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

export interface BestProgressionResponse {
  index: number;
  description: string;
  logic: string;
}

export interface BestHeadingEvaluationResponse {
  code: string;
  evaluation: string;
}

export interface RankedDescriptionsResponse {
  rankedDescriptions: RankedCandidateSelection[];
}

export interface RankedCandidateSelection extends CandidateSelection {
  rank: number;
}

export interface BestCandidatesResponse {
  bestCandidates: CandidateSelection[];
}

export interface BestChaptersResponse {
  chapters: number[];
}

export interface HeadingSelection {
  heading: string;
  description: string;
  logic: string;
}

export interface CandidateSelection {
  index: number;
  description: string;
  logic: string;
}

export interface Classification {
  articleDescription: string;
  articleAnalysis: string;
  progressionDescription: string;
  levels: ClassificationProgression[];
}

export interface ClassificationProgression {
  candidates: HtsElement[];
  selection?: HtsElement;
  reasoning?: string;
}

export interface TemporaryTariff {
  description: string;
  element?: HtsElement;
}
