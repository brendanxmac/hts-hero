import { Feature } from "@/components/FeaturesAccordion";

export enum GuideName {
  EXPLORE = "EXPLORE",
  CLASSIFY = "CLASSIFY",
  // Add more guide names as needed
}

export interface Guide {
  name: GuideName;
  steps: Feature[];
  routes?: string[];
  daysUntilShowAgain?: number;
}
