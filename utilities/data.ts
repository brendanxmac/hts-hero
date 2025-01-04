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

export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
    console.log("Text copied to clipboard!");
  } catch (err) {
    // TODO: handle errors here
    console.error("Failed to copy text:", err);
  }
};

export const stripTrailingPeriods = (input: string): string => {
  return input.trim().replace(/\.+$/, "");
};
