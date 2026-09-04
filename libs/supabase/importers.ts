import { Importer } from "../../interfaces/hts";
import apiClient from "../api";

export const fetchImportersForUser = async (): Promise<Importer[]> => {
  const importers = await apiClient.get(`/importers`);
  return Array.isArray(importers) ? importers : [];
};

export const fetchImportersForTeam = async (
  teamId: string
): Promise<Importer[]> => {
  const importers = await apiClient.get(`/importers?teamId=${teamId}`);
  return Array.isArray(importers) ? importers : [];
};

export const createImporter = async (
  name: string,
  teamId?: string
): Promise<Importer> => {
  return apiClient.post(`/importers/create`, { name, teamId });
};
