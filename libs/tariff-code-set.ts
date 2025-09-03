import { TariffCodeSet } from "../tariffs/announcements/announcements";
import apiClient from "./api";

export const fetchTariffCodeSets = async (): Promise<TariffCodeSet[]> => {
  const fetchCodeSetsResponse: TariffCodeSet[] =
    await apiClient.get(`/tariff-code-sets`);

  return fetchCodeSetsResponse;
};
