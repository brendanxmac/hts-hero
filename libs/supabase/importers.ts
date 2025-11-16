import { Importer } from "../../interfaces/hts";
import apiClient from "../api";

export const fetchImportersForUser = async (): Promise<Importer[]> => {
  return apiClient.get(`/importers`);
};

export const fetchImportersForTeam = async (
  teamId: string
): Promise<Importer[]> => {
  return apiClient.get(`/importers?teamId=${teamId}`);
};

export const createImporter = async (
  name: string,
  teamId?: string
): Promise<Importer> => {
  return apiClient.post(`/importers/create`, { name, teamId });
};
