import { PricingPlan } from "../../types";
import { createSupabaseClient } from "./client";

export interface Purchase {
  id: string;
  user_id: string;
  price_id: string;
  customer_id: string;
  product_name: PricingPlan;
  expires_at: string;
  created_at: string;
}

export interface CreatePurchaseDto {
  user_id: string;
  price_id: string;
  customer_id: string;
  product_name: PricingPlan;
  expires_at: string;
}

export const createPurchase = async (
  purchase: CreatePurchaseDto,
  stripeEvent?: string
) => {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("purchases")
    .insert(purchase)
    .select()
    .single<Purchase>(); // returns inserted row

  if (error) {
    console.error(
      `Failed to insert purchase for stripe event for user ${purchase.user_id} ${stripeEvent ? `and stripe event ${stripeEvent}` : ""}:`,
      error
    );
    throw error;
  }

  return data;
};

export const userHasActivePurchaseForProduct = async (
  userId: string,
  product: Product
) => {
  const userPurchases = await fetchPurchasesForUser(userId);
  // Add 2-day buffer to prevent lockouts during subscription renewal delays
  const expirationDateWithBuffer = new Date();
  expirationDateWithBuffer.setDate(expirationDateWithBuffer.getDate() - 2);

  const activePurchases = userPurchases.filter(
    (purchase) => new Date(purchase.expires_at) > expirationDateWithBuffer
  );

  if (product === Product.CLASSIFY) {
    return activePurchases.some(
      (purchase) => purchase.product_name === PricingPlan.CLASSIFY_PRO
    );
  }

  if (product === Product.TARIFF_IMPACT) {
    return activePurchases.some(
      (purchase) =>
        purchase.product_name === PricingPlan.TARIFF_IMPACT_PRO ||
        purchase.product_name === PricingPlan.TARIFF_IMPACT_STANDARD
    );
  }

  return false;
};

export const getProductForPlan = (plan: PricingPlan) => {
  switch (plan) {
    case PricingPlan.CLASSIFY_PRO:
      return Product.CLASSIFY;
    case PricingPlan.TARIFF_IMPACT_STARTER:
    case PricingPlan.TARIFF_IMPACT_STANDARD:
    case PricingPlan.TARIFF_IMPACT_PRO:
      return Product.TARIFF_IMPACT;
  }
};

export enum Product {
  CLASSIFY = "classify",
  TARIFF_IMPACT = "tariff_impact",
}

export const userHasActivePurchase = async (userId: string) => {
  const supabase = createSupabaseClient();

  // Add 2-day buffer to prevent lockouts during subscription renewal delays
  const bufferDate = new Date();
  bufferDate.setDate(bufferDate.getDate() - 2);

  const { data: purchases, error } = await supabase
    .from("purchases")
    .select("*")
    .eq("user_id", userId)
    .gte("expires_at", bufferDate.toISOString());

  if (error) {
    console.error("Failed to fetch active purchases:", error);
    throw error;
  }

  return purchases.length > 0;
};

export const getLatestPurchase = async (
  userId: string
): Promise<Purchase | null> => {
  const supabase = createSupabaseClient();

  const { data: purchase, error } = await supabase
    .from("purchases")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single<Purchase>();

  if (error) {
    console.error("Failed to fetch active purchases:", error);
    throw error;
  }

  return purchase;
};

export const fetchPurchasesForUser = async (userId: string) => {
  const supabase = createSupabaseClient();

  const { data: purchases, error } = await supabase
    .from("purchases")
    .select("*")
    .eq("user_id", userId)
    .order("expires_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch purchases:", error);
    throw error;
  }

  return purchases as Purchase[];
};

export const getActiveClassifyPurchase = async (userId: string) => {
  const allPurchases = await fetchPurchasesForUser(userId);
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const activeClassifyPurchases = allPurchases.find(
    (purchase) =>
      purchase.product_name === PricingPlan.CLASSIFY_PRO &&
      purchase.expires_at > yesterday
  );

  return activeClassifyPurchases;
};

export const getActiveTariffImpactPurchases = async (userId: string) => {
  const tariffImpactProducts = [
    PricingPlan.TARIFF_IMPACT_STANDARD,
    PricingPlan.TARIFF_IMPACT_PRO,
  ];
  const allPurchases = await fetchPurchasesForUser(userId);
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const activeTariffImpactPurchases = allPurchases.filter(
    (purchase) =>
      tariffImpactProducts.includes(purchase.product_name) &&
      purchase.expires_at > yesterday
  );

  return activeTariffImpactPurchases;
};

export const getActivePriorityTariffImpactPurchase = async (
  userId: string
): Promise<Purchase | null> => {
  const activeTariffImpactPurchases =
    await getActiveTariffImpactPurchases(userId);

  if (activeTariffImpactPurchases.length === 0) {
    return null;
  }

  if (activeTariffImpactPurchases.length === 1) {
    return activeTariffImpactPurchases[0];
  }

  // This works because the list is already sorted by expires_at DESCENDING
  // so the list has the newest subscriptions first, therefore finding the first
  // active tariff impact purchase is the one with the newest expires_at

  // Find the first active PRO purchase because it's the most powerful and handles
  // cases where the user might have upgraded and has 2 active purchases
  const proPurchase = activeTariffImpactPurchases.find(
    (purchase) => purchase.product_name === PricingPlan.TARIFF_IMPACT_PRO
  );

  if (proPurchase) {
    return proPurchase;
  }

  // If no PRO purchase found, find the first STANDARD purchase
  const standardPurchase = activeTariffImpactPurchases.find(
    (purchase) => purchase.product_name === PricingPlan.TARIFF_IMPACT_STANDARD
  );

  if (standardPurchase) {
    return standardPurchase;
  }

  // If no standard then there is no active / best
  return null;
};
