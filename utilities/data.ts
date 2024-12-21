import { HtsWithParentReference } from "../interfaces/hts";

export const elementsAtIndentLevel = (
  elements: HtsWithParentReference[],
  indentLevel: number
) => {
  return elements.filter((e) => Number(e.indent) === indentLevel);
};

export const setIndexInArray = <T extends Object>(
  elements: T[]
): Array<T & { indexInParentArray: number }> => {
  return elements.map((e, i) => ({ ...e, indexInParentArray: i }));
};
