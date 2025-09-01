import { TariffImpactCheck } from "../interfaces/tariffs";
import { PricingPlan } from "../types";
import apiClient from "./api";
import { parseHtsCodeSet } from "./hts-code-set";

export const createTariffImpactCheck = async (
  htsCodesString: string
): Promise<TariffImpactCheck> => {
  const parsedHtsCodes = parseHtsCodeSet(htsCodesString);

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
