// The duty calculator's results: summary, statement, adjustments, comparison and cost breakdown.
// Only what's used outside this folder is exported.
export { SummaryStats } from "./SummaryStats";
export { Statement } from "./Statement";
export { SimpleSummary } from "./SimpleSummary";
export { PreferenceClaim } from "./PreferenceClaim";
export { QuestionsPanel } from "./QuestionsPanel";
export { NotAppliedPanel } from "./NotAppliedPanel";
export { CompareView } from "./CompareView";
export type { CompareEntry } from "./compareEntry";
export { CostBar } from "./CostBar";
export { BASE_SLICE, sliceForProgram, slices } from "./slices";
export { COLUMN_LABEL, describeHtsRevision, programName } from "./labels";
// Temporary alias for RateHistory's import of CHART; use CHART_COLORS from @/components/ui/theme
export { CHART_COLORS as CHART } from "@/components/ui/theme";
