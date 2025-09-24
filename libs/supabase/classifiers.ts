import apiClient from "../api";
import { Classifier } from "../../interfaces/hts";

export const fetchClassifiersForUser = async (): Promise<Classifier[]> => {
  return apiClient.get(`/classifiers`);
};

export const createClassifier = async (name: string): Promise<Classifier> => {
  return apiClient.post(`/classifiers/create`, { name });
};
