import { HtsElementWithParentReference } from "../interfaces/hts";

export const elementsAtClassificationLevel = (
  elements: HtsElementWithParentReference[],
  level: number
) => {
  return elements.filter((e) => Number(e.indent) === level);
};

export const setIndexInArray = <T extends Object>(
  elements: T[]
): Array<T & { indexInParentArray: number }> => {
  return elements.map((e, i) => ({ ...e, indexInParentArray: i }));
};

export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    // TODO: handle errors here
    console.error("Failed to copy text:", err);
  }
};

export const stripTrailingPeriods = (input: string): string => {
  return input.trim().replace(/\.+$/, "");
};

export const getMinMaxRangeText = (
  minMatches?: number,
  maxMatches?: number
) => {
  if (minMatches && maxMatches) {
    if (minMatches > maxMatches || minMatches === maxMatches) {
      throw new Error("Min matches must be less than max matches");
    }

    return `at least ${minMatches}, up to ${maxMatches}`;
  }

  if (minMatches) {
    return `at least ${minMatches}`;
  }

  if (maxMatches) {
    if (maxMatches === 1) {
      return "only 1";
    }
    return `up to ${maxMatches}`;
  }

  return "at least 1, up to 3";
};
