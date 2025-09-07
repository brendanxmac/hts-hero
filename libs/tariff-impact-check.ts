import { TariffImpactCheck } from "../interfaces/tariffs";
import { TariffCodeSet } from "../tariffs/announcements/announcements";
import apiClient from "./api";
import { validateTariffableHtsCode } from "./hts";
import {
  formatHtsCodeWithPeriods,
  getValidHtsCodesFromString,
} from "./hts-code-set";

export interface TariffImpactResult {
  code: string;
  impacted: boolean | null;
  error?: string;
}

export const checkTariffImpactsForCodes = (
  htsCodesString: string,
  tariffCodeSet: TariffCodeSet
): TariffImpactResult[] => {
  const separators = /[\n, ]/;
  const parsedCodes = htsCodesString
    .trim()
    .split(separators)
    .map((code) => code.trim())
    .filter((code) => code.length > 0);

  return parsedCodes.map((code) => {
    const { valid: isValidTariffableCode, error } =
      validateTariffableHtsCode(code);
    // Format the code with proper periods if it's valid
    const formattedCode = isValidTariffableCode
      ? formatHtsCodeWithPeriods(code)
      : code;

    return {
      code: formattedCode,
      impacted: isValidTariffableCode
        ? codeIsIncludedInTariffCodeSet(code, tariffCodeSet)
        : null,
      error,
    };
  });
};

export const createTariffImpactCheck = async (
  htsCodesString: string
): Promise<TariffImpactCheck> => {
  const parsedHtsCodes = getValidHtsCodesFromString(htsCodesString);

  if (parsedHtsCodes.length === 0) {
    throw new Error("No valid HTS codes provided");
  }

  const createHtsCodeSetResponse: TariffImpactCheck = await apiClient.post(
    "/tariff-impact-check/create",
    { htsCodes: parsedHtsCodes }
  );

  return createHtsCodeSetResponse;
};

export const fetchTariffImpactChecksForUser = async (
  startDate?: Date,
  endDate?: Date
): Promise<TariffImpactCheck[]> => {
  const tariffImpactChecksForUser: TariffImpactCheck[] = await apiClient.get(
    `/tariff-impact-check`,
    {
      params: {
        startDate,
        endDate,
      },
    }
  );

  return tariffImpactChecksForUser;
};

export const codeIsIncludedInTariffCodeSet = (
  code: string,
  tariffCodeSet: TariffCodeSet
) => {
  const formattedCode = formatHtsCodeWithPeriods(code);

  return tariffCodeSet.codes.some(
    (change) => formattedCode.includes(change) || change.includes(formattedCode)
  );
};
