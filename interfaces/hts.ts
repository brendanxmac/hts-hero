export interface CandidateQualificationResponse {
  analysis: string;
  unqualifiedCandidates: number[];
}

export interface PreliminaryCandidate {
  identifier: number; // the number of the candidate (ie, chapter 1, 17, etc..)
  description: string; // the title that is assigned to the candidate, e.g. "Live Animals"
}

export type PreliminaryCandidateType = "section" | "chapter";

export interface QualifyCandidatesWithNotesDto {
  productDescription: string;
  candidates: PreliminaryCandidate[];
  candidateType: PreliminaryCandidateType;
}

export interface BestCandidateAnalysisDto {
  productDescription: string;
  candidates: SimplifiedHtsElement[];
}

export type RelevanceType =
  | "exclusion"
  | "definition"
  | "inclusion"
  | "classification"
  | "scope"
  | "condition"
  | "cross_reference"
  | "administrative"
  | "measurement";

export interface HTSNote {
  id: string;
  section: number;
  chapter: number | null; // null for section-level notes (before any chapter heading)
  subchapter: string | null;
  noteGroup: string;
  citation: string;
  depth: number;
  parentId: string | null;
  text: string;
  children: string[];
  referencedHtsCodes: string[];
  // Enrichment
  relevance?: RelevanceType[];
  sortOrder: number; // Global order within the document for deterministic reconstruction
}

export interface HtsCodeSet {
  id: string;
  user_id: string;
  name?: string;
  codes: string[]; // <-- Treat codes as a string array in TypeScript
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Eval {
  index: number;
  content: string;
  reasoning: string;
}

export interface UINote {
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

export interface SectionAndChapterDetails {
  section: {
    number: number;
    description: string;
    filePath: string;
  };
  chapter: HtsSectionAndChapterBase;
}

export interface HtsSection extends HtsSectionAndChapterBase {
  chapters: HtsSectionAndChapterBase[];
}

export interface HtsSectionAndChapterBase {
  number: number;
  description: string;
  filePath?: string;
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
  analysis: string;
  questions?: string[];
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
  bestCandidates: number[];
}

export interface BestChaptersResponse {
  chapters: number[];
}

export interface HeadingSelection {
  heading: string;
  description: string;
  logic: string;
}

export interface SelectionWithReason extends CandidateSelection {
  logic: string;
}

export interface CandidateSelection {
  index: number;
  // description: string;
  // logic: string;
}

export enum ClassificationStatus {
  DRAFT = "draft",
  REVIEW = "review",
  FINAL = "final",
}

export interface ClassificationRecord {
  id: string;
  user_id: string;
  team_id?: string;
  importer_id?: string;
  classifier?: {
    name?: string;
    email: string;
  };
  importer?: {
    name: string;
  };
  classifier_id?: string;
  classification: Classification;
  created_at: string;
  updated_at: string;
  revision: string;
  status: ClassificationStatus;
  country_of_origin?: string;
}

export interface Classification {
  articleDescription: string;
  articleAnalysis: string;
  progressionDescription: string;
  levels: ClassificationProgression[];
  isComplete: boolean;
  notes?: string;
}

export interface ClassificationProgression {
  candidates: HtsElement[];
  analysisElement?: HtsElement;
  analysisReason?: string;
  analysisQuestions?: string[];
  notes?: string;
  selection?: HtsElement;
  reasoning?: string;
}

export interface TemporaryTariff {
  description: string;
  element?: HtsElement;
}

export interface Classifier {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface Importer {
  id: string;
  user_id?: string;
  team_id?: string;
  name: string;
  created_at: string;
}
