import { HtsElement } from "../interfaces/hts";

// The headings above an HTS line, outermost first. No browser or app imports, so the duty
// engine's helpers can use it on the server (the MCP server, /hts pages) as well as in the app.
export const getHtsElementParents = (element: HtsElement, elements: HtsElement[]): HtsElement[] => {
  // If element is at indent 0, it has no parents
  if (element.indent === "0") {
    return [];
  }
  // Get index of this element
  const elementIndex = elements.findIndex((e) => e.uuid === element.uuid);

  // Iterate through elements backwards until we find an element with an indent level that is one less than the current element
  for (let i = elementIndex - 1; i >= 0; i--) {
    if (elements[i].indent === String(Number(element.indent) - 1)) {
      // Add current element to end parents array and recurse
      return [...getHtsElementParents(elements[i], elements), elements[i]];
    }
  }

  return [];
};
