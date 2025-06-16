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

export const createPurchase = async (purchase: CreatePurchaseDto) => {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("purchases")
    .insert(purchase)
    .select()
    .single<Purchase>(); // returns inserted row

  if (error) {
    console.error("Failed to insert purchase:", error);
    throw error;
  }

  return data;
};

export const userHasActivePurchase = async (userId: string) => {
  const supabase = createSupabaseClient();

  const { data: purchases, error } = await supabase
    .from("purchases")
    .select("*")
    .eq("user_id", userId)
    .gte("expires_at", new Date().toISOString());

  if (error) {
    console.error("Failed to fetch active purchases:", error);
    throw error;
  }

  return purchases.length > 0;
};
