import { TariffImpactCheck } from "../interfaces/tariffs";
import { TariffCodeSet } from "../tariffs/announcements/announcements";
import apiClient from "./api";
import { formatHtsCodeWithPeriods, parseHtsCodeSet } from "./hts-code-set";

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

export const codeIsIncludedInTariffCodeSet = (
  code: string,
  tariffCodeSet: TariffCodeSet
) => {
  const formattedCode = formatHtsCodeWithPeriods(code);

  return tariffCodeSet.codes.some(
    (change) => formattedCode.includes(change) || change.includes(formattedCode)
  );
};
