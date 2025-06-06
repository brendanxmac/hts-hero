import apiClient from "@/libs/api";

export enum RegistrationTrigger {
  referral = "referral",
  hero = "hero",
  oneDayPass = "pricing_one_day_pass",
  fiveDayPass = "pricing_five_day_pass",
  standard = "pricing_standard",
  pro = "pricing_pro",
  cta = "cta",
  feature_notes = "feature_notes",
  feature_cross_rulings = "feature_cross_rulings",
  feature_match_suggestions = "feature_match_suggestions",
  feature_product_analysis = "feature_product_analysis",
  feature_report_generation = "feature_report_generation",
  feature_more_features = "feature_more_features",
}

export const addEarlyRegistrationAttempt = async (
  windowName: string,
  buttonClicked: RegistrationTrigger,
  source?: string
) => {
  const earlyRegistrationAttemptsResponse: {
    success?: boolean;
    error?: string;
  } = await apiClient.post("/early-registration/attempt", {
    windowName,
    buttonClicked,
    source,
  });

  return earlyRegistrationAttemptsResponse;
};

export const addToEarlyRegistration = async (
  windowName: string,
  email: string,
  buttonClicked: RegistrationTrigger,
  jobTitle?: string,
  source?: string
) => {
  const earlyRegistrationResponse: { success?: boolean; error?: string } =
    await apiClient.post("/early-registration", {
      windowName,
      email,
      buttonClicked,
      jobTitle,
      source,
    });

  return earlyRegistrationResponse;
};
