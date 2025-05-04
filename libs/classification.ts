import { Classification, FetchedClassification } from "../interfaces/hts";
import apiClient from "./api";

export const createClassification = async (classification: Classification) => {
  const response = await apiClient.post("/classification/create", {
    classification: classification,
  });

  return response.data;
};

export const fetchClassifications = async (): Promise<
  FetchedClassification[]
> => {
  const classifications: FetchedClassification[] = await apiClient.get(
    "/classification/fetch"
  );

  return classifications;
};
