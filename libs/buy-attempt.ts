import { BuyAttempt } from "../app/api/buy-attempt/route";
import apiClient from "./api";

export const upsertBuyAttempt = async (buyAttempt: Partial<BuyAttempt>) => {
  const buyAttemptResponse: BuyAttempt = await apiClient.post(
    "/buy-attempt",
    buyAttempt
  );

  return buyAttemptResponse;
};
