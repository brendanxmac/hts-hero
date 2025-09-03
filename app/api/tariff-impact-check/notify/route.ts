"use server";

import { NextResponse, NextRequest } from "next/server";
import { createClient } from "../../supabase/server";
import { getActiveTariffImpactPurchasesForUser } from "../../../../libs/supabase/purchase";
import { SupabaseClient } from "@supabase/supabase-js";
import { PricingPlan } from "../../../../types/config";
import { TariffCodeSet } from "../../../../tariffs/announcements/announcements";
import { validateTariffableHtsCode } from "../../../../libs/hts";
import { HtsCodeSet } from "../../../../interfaces/hts";
import { codeIsIncludedInTariffCodeSet } from "../../../../libs/tariff-impact-check";
import { sendTariffImpactCheckEmail } from "../../../../emails/tariff-impact/tariff-impact-check-email";
import { fetchUser } from "../../../../libs/supabase/user";

const requesterIsAdmin = (req: NextRequest) => {
  const serverApiKey = process.env.SERVER_ADMIN_API_KEY;
  const requestApiKey = req.headers.get("x-api-key");

  return requestApiKey || requestApiKey === serverApiKey;
};

export const fetchActiveTariffImpactPurchases = async (
  supabase: SupabaseClient
) => {
  const { data: purchases, error } = await supabase
    .from("purchases")
    .select("*")
    .in("product_name", [
      PricingPlan.TARIFF_IMPACT_STANDARD,
      PricingPlan.TARIFF_IMPACT_PRO,
    ])
    .gte(
      "expires_at",
      new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    );

  if (error) {
    console.error("Failed to fetch active tariff impact purchases:", error);
    throw error;
  }

  return purchases;
};

export const fetchCodeSetsForUser = async (
  supabase: SupabaseClient,
  userId: string
): Promise<HtsCodeSet[]> => {
  const { data: codeSets, error } = await supabase
    .from("hts_code_sets")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to codes sets for user:", error);
    throw error;
  }

  return codeSets;
};

export const fetchTariffCodeSet = async (
  supabase: SupabaseClient,
  id: string
) => {
  const { data: codeSet, error } = await supabase
    .from("tariff_code_sets")
    .select("*")
    .eq("id", id)
    .single<TariffCodeSet>();

  if (error) {
    console.error(`Failed to tariff code set with id: ${id}`, error);
    throw new Error(`Bad Request`);
  }

  return codeSet;
};

export async function POST(req: NextRequest) {
  try {
    if (!requesterIsAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const { tariffCodeSetId } = body;

    if (!tariffCodeSetId) {
      return NextResponse.json({ error: "Bad Request" }, { status: 400 });
    }

    const supabase = createClient();
    const tariffCodeSet = await fetchTariffCodeSet(supabase, tariffCodeSetId);

    // Fetch Active Tariff Impact Purchases
    const activeTariffImpactPurchases =
      await fetchActiveTariffImpactPurchases(supabase);

    // Get Unique Users with Active Tariff Impact Purchase
    const usersWithActiveTariffImpactPurchases =
      activeTariffImpactPurchases.reduce<string[]>((acc, purchase) => {
        if (!acc.includes(purchase.user_id)) {
          acc.push(purchase.user_id);
        }
        return acc;
      }, []);

    // Get Code Sets for Each User with Active Tariff Impact Purchase
    usersWithActiveTariffImpactPurchases.forEach(async (userId: string) => {
      const user = await fetchUser(userId);
      const codeSets = await fetchCodeSetsForUser(supabase, userId);
      codeSets.forEach(async (codeSet) => {
        const codesIncludedInTariffSet = codeSet.codes.filter((code) => {
          return codeIsIncludedInTariffCodeSet(code, tariffCodeSet);
        });

        console.log(
          "codesIncludedInTariffSet:",
          codesIncludedInTariffSet.length
        );

        if (codesIncludedInTariffSet.length > 0) {
          const emailSubject = `🚨 ${codesIncludedInTariffSet.length} of your imports ${codesIncludedInTariffSet.length > 1 ? "are" : "is"} included in a new tariff announcement`;
          console.log("User email:");
          console.log(user.email);
          await sendTariffImpactCheckEmail(
            user.email,
            tariffCodeSet.name,
            emailSubject
          );
          // TODO: if codesIncludedInTariffSet is not empty, send email to user saying:
          console.log(
            `🚨 ${codesIncludedInTariffSet.length} of your imports ${codesIncludedInTariffSet.length > 1 ? "are" : "is"} included in a new tariff announcement`
          );
          console.log(
            `Some of your ${codeSet.name} imports are included in the latest tariff announcement: ${tariffCodeSet.name}`
          );
          console.log();
        }
      });
    });

    // For each, fetch all their sets
    // For each set, do impact check against list

    return NextResponse.json({ message: "success" }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
