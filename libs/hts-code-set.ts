import { HtsCodeSet } from "../interfaces/hts";
import apiClient from "./api";
import { validateTariffableHtsCode } from "./hts";

// Helper function to format HTS codes with proper periods
export const formatHtsCodeWithPeriods = (code: string): string => {
  // Remove any existing periods first
  const digitsOnly = code.replace(/\./g, "");

  // Only format if it's a valid length (4, 6, 8, or 10 digits)
  if (digitsOnly.length === 4) {
    return digitsOnly; // Just the heading: 1234
  } else if (digitsOnly.length === 6) {
    return `${digitsOnly.slice(0, 4)}.${digitsOnly.slice(4, 6)}`; // 1234.56
  } else if (digitsOnly.length === 8) {
    return `${digitsOnly.slice(0, 4)}.${digitsOnly.slice(4, 6)}.${digitsOnly.slice(6, 8)}`; // 1234.56.78
  } else if (digitsOnly.length === 10) {
    return `${digitsOnly.slice(0, 4)}.${digitsOnly.slice(4, 6)}.${digitsOnly.slice(6, 8)}.${digitsOnly.slice(8, 10)}`; // 1234.56.78.90
  }
  // else if (digitsOnly.length > 10) {
  //   // For codes longer than 10 digits, format as 10-digit and ignore the rest
  //   return `${digitsOnly.slice(0, 4)}.${digitsOnly.slice(4, 6)}.${digitsOnly.slice(6, 8)}.${digitsOnly.slice(8, 10)}`;
  // }

  // Return as-is if it doesn't match expected lengths
  return code;
};

export const getHtsCodesFromString = (str: string) => {
  // Parse input by newlines or commas for processing
  const separators = /[\n, ]/;
  return str
    .trim()
    .split(separators)
    .map((code) => code.trim())
    .filter((code) => code.length > 0);
};

export const getValidHtsCodesFromSet = (codes: string[]) => {
  return codes
    .filter((code) => validateTariffableHtsCode(code).valid)
    .map(formatHtsCodeWithPeriods);
};

export const getValidHtsCodesFromString = (htsCodeSet: string): string[] => {
  const htsCodes = getHtsCodesFromString(htsCodeSet);
  const validTariffableHtsCodes = htsCodes.filter(
    (code) => validateTariffableHtsCode(code).valid
  );

  const parsedHtsCodes = validTariffableHtsCodes.map(formatHtsCodeWithPeriods);

  return parsedHtsCodes;
};

export const createHtsCodeSet = async (
  htsCodesString: string,
  name?: string,
  description?: string
): Promise<HtsCodeSet> => {
  const parsedHtsCodes = getValidHtsCodesFromString(htsCodesString);

  if (parsedHtsCodes.length === 0) {
    throw new Error("No valid HTS codes provided");
  }

  const createHtsCodeSetResponse: HtsCodeSet = await apiClient.post(
    "/hts-code-sets/create",
    { htsCodes: parsedHtsCodes, name, description }
  );

  return createHtsCodeSetResponse;
};

export const fetchHtsCodeSetsForUser = async (): Promise<HtsCodeSet[]> => {
  const fetchHtsCodeSetsForUserResponse: HtsCodeSet[] =
    await apiClient.get(`/hts-code-sets`);

  return fetchHtsCodeSetsForUserResponse;
};

export const updateHtsCodeSet = async (
  setId: string,
  htsCodes: string[]
): Promise<HtsCodeSet> => {
  const updateHtsCodeSetResponse: HtsCodeSet = await apiClient.post(
    "/hts-code-sets/update",
    { id: setId, htsCodes }
  );

  return updateHtsCodeSetResponse;
};
