import { TariffImpactCheck } from "../interfaces/tariffs";
import { TariffCodeSet } from "../tariffs/announcements/announcements";
import { PricingPlan } from "../types";
import apiClient from "./api";
import { validateTariffableHtsCode } from "./hts";
import { formatHtsCodeWithPeriods } from "./hts-code-set";

export interface TariffImpactResult {
  code: string;
  impacted: boolean | null;
  error?: string;
}

export const sentEmailWithExampleOfTariffImpactCheck = (email: string) => {
  console.log("Sending Fake Impact Check Email");
  return apiClient.post("/tariff-impact-check/example-email", { email });
};

export const checkTariffImpactsForCodes = (
  htsCodes: string[],
  tariffCodeSet: TariffCodeSet
): TariffImpactResult[] => {
  return htsCodes.map((code) => {
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
  tariffCodeSetId: string,
  htsCodes: string[],
  htsCodeSetId?: string,
  plan: PricingPlan | "Trial" = "Trial"
): Promise<TariffImpactCheck> => {
  return await apiClient.post("/tariff-impact-check/create", {
    htsCodes,
    tariffCodeSetId,
    htsCodeSetId,
    plan,
  });
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

  return (
    tariffCodeSet.codes.includes("*") ||
    tariffCodeSet.codes.some(
      (code) => formattedCode.includes(code) || code.includes(formattedCode)
    )
  );
};
