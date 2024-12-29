import { HtsWithParentReference } from "../interfaces/hts";

export const elementsAtClassificationLevel = (
  elements: HtsWithParentReference[],
  level: number
) => {
  return elements.filter((e) => Number(e.indent) === level);
};

export const setIndexInArray = <T extends Object>(
  elements: T[]
): Array<T & { indexInParentArray: number }> => {
  return elements.map((e, i) => ({ ...e, indexInParentArray: i }));
};
