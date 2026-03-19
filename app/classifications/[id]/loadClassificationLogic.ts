/**
 * Pure logic for classification load error handling.
 * Extracted for testability - ensures we don't show "Classification not found"
 * when the fetch succeeds (handles React Strict Mode race) or when only
 * fetchElements fails (non-fatal).
 */
export function getClassificationLoadError(
  fetchClassificationSucceeded: boolean,
  fetchElementsSucceeded: boolean
): string | null {
  if (!fetchClassificationSucceeded) {
    return "Classification not found";
  }
  // fetchElements failure is non-fatal - we have the record
  return null;
}
