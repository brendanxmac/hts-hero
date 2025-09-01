import { HtsCodeSet } from "../interfaces/hts";
import { parseHtsCodeSet } from "../libs/hts-code-set";

// Regex that gets whatever is inside the parentheses of special text, if exists
export const getStringBetweenParenthesis = (str: string) => {
  const regex = /\(([^)]+)\)/;
  const match = str.match(regex);
  // We also add a space after each comma
  return match ? match[1].replace(/,/g, ", ") : null;
};

// Regex that gets the prefix of the special text
export const getStringBeforeOpeningParenthesis = (str: string) => {
  const regex = /^[^(]+/;
  const match = str.match(regex);
  return match ? match[0].trim() : str;
};

export const findCodeSet = (id: string, codeSets: HtsCodeSet[]) => {
  return codeSets.find((set) => set.id === id);
};

export const codeSetMatchesString = (str: string, htsCodeSet: HtsCodeSet) => {
  const stringCodes = parseHtsCodeSet(str);

  // Check if current input is different from the selected set
  if (stringCodes.length !== htsCodeSet.codes.length) {
    return false;
  }

  const sortedStringCodes = [...stringCodes].sort();
  const sortedSetCodes = [...htsCodeSet.codes].sort();

  return sortedStringCodes.every(
    (code, index) => code === sortedSetCodes[index]
  );
};
