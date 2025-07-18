import { FeatureI } from "../interfaces/ui";

export enum GuideName {
  EXPLORE = "EXPLORE",
  CLASSIFY = "CLASSIFY",
  // Add more guide names as needed
}

export interface Guide {
  name: GuideName;
  steps: FeatureI[];
  routes?: string[];
  daysUntilShowAgain?: number;
}
