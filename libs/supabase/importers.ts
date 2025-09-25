import { Importer } from "../../interfaces/hts";
import apiClient from "../api";

export const fetchImportersForUser = async (): Promise<Importer[]> => {
  return apiClient.get(`/importers`);
};

export const createImporter = async (name: string): Promise<Importer> => {
  return apiClient.post(`/importers/create`, { name });
};
