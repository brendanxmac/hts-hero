"use server";

import { NextResponse, NextRequest } from "next/server";
import { createClient } from "../../supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { PricingPlan } from "../../../../types/config";
import { TariffCodeSet } from "../../../../tariffs/announcements/announcements";
import { HtsCodeSet } from "../../../../interfaces/hts";
import { codeIsIncludedInTariffCodeSet } from "../../../../libs/tariff-impact-check";
import { sendTariffImpactCheckEmail } from "../../../../emails/tariff-impact/tariff-impact-check-email";
import {
  fetchUser,
  fetchUsers,
  UserProfile,
} from "../../../../libs/supabase/user";
import { sendTariffImpactCheckResultsEmail } from "../../../../emails/tariff-impact/tariff-impact-check-results-email";

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

const processTariffImpactNotifications = async (tariffCodeSetId: string) => {
  const errors: string[] = [];
  let processedUsers = 0;
  let processedCodeSets = 0;
  let emailsSent = 0;

  try {
    const supabase = createClient();
    const tariffCodeSet = await fetchTariffCodeSet(supabase, tariffCodeSetId);

    // Fetch Active Tariff Impact Purchases
    const activeTariffImpactPurchases =
      await fetchActiveTariffImpactPurchases(supabase);

    // Get Unique Users with Active Tariff Impact Purchase
    const userIdsWithActiveTariffImpactPurchases =
      activeTariffImpactPurchases.reduce<string[]>((acc, purchase) => {
        if (!acc.includes(purchase.user_id)) {
          acc.push(purchase.user_id);
        }
        return acc;
      }, []);

    const usersWithTariffImpactPurchases = await fetchUsers(
      userIdsWithActiveTariffImpactPurchases
    );

    console.log(
      `Users with Tariff Impact Purchases: ${usersWithTariffImpactPurchases.length}`
    );

    // Process each user with error handling
    for (const user of usersWithTariffImpactPurchases) {
      try {
        processedUsers++;
        const codeSets = await fetchCodeSetsForUser(supabase, user.id);

        // Process each codeSet for this user with error handling
        for (const codeSet of codeSets) {
          try {
            processedCodeSets++;
            const codesIncludedInTariffSet = codeSet.codes.filter((code) => {
              return codeIsIncludedInTariffCodeSet(code, tariffCodeSet);
            });

            if (codesIncludedInTariffSet.length > 0) {
              const emailSubject = `🚨 ${codesIncludedInTariffSet.length} of your imports ${codesIncludedInTariffSet.length > 1 ? "are" : "is"} included in a new tariff announcement`;

              try {
                // await sendTariffImpactCheckEmail(
                //   user.email,
                //   tariffCodeSet.name,
                //   emailSubject
                // );
                emailsSent++;

                console.log(
                  `🚨 ${codesIncludedInTariffSet.length} of your imports ${codesIncludedInTariffSet.length > 1 ? "are" : "is"} included in a new tariff announcement`
                );
                console.log(
                  `Some of your ${codeSet.name} imports are included in the latest tariff announcement: ${tariffCodeSet.name}`
                );
                console.log();
              } catch (emailError) {
                const errorMsg = `Failed to send email to user ${user.id} (${user.email}) for codeSet ${codeSet.id}: ${emailError instanceof Error ? emailError.message : String(emailError)}`;
                errors.push(errorMsg);
                console.error(errorMsg, emailError);
              }
            }
          } catch (codeSetError) {
            const errorMsg = `Failed to process codeSet ${codeSet.id} for user ${user.id}: ${codeSetError instanceof Error ? codeSetError.message : String(codeSetError)}`;
            errors.push(errorMsg);
            console.error(errorMsg, codeSetError);
          }
        }
      } catch (userError) {
        const errorMsg = `Failed to process user ${user.id} (${user.email}): ${userError instanceof Error ? userError.message : String(userError)}`;
        errors.push(errorMsg);
        console.error(errorMsg, userError);
      }
    }

    // Log final processing summary
    console.log(`Tariff impact notification processing completed:`);
    console.log(`- Processed ${processedUsers} users`);
    console.log(`- Processed ${processedCodeSets} code sets`);
    console.log(`- Sent ${emailsSent} emails`);
    console.log(`- Encountered ${errors.length} errors`);

    if (errors.length > 0) {
      console.log(`Errors encountered:`);
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    const processingResults = {
      processedUsers,
      processedCodeSets,
      emailsSent,
      errors,
    };

    sendTariffImpactCheckResultsEmail(tariffCodeSet.name, processingResults);
  } catch (error) {
    const errorMsg = `Critical error in processTariffImpactNotifications: ${error instanceof Error ? error.message : String(error)}`;
    errors.push(errorMsg);
    console.error(errorMsg, error);
  }
};

export async function POST(req: NextRequest) {
  try {
    // Validate request authorization
    if (!requesterIsAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate request body
    const body = await req.json();
    const { tariffCodeSetId } = body;

    if (!tariffCodeSetId) {
      return NextResponse.json({ error: "Bad Request" }, { status: 400 });
    }

    // Validate that the tariff code set exists
    const supabase = createClient();
    await fetchTariffCodeSet(supabase, tariffCodeSetId);

    // Start processing asynchronously (don't await)
    processTariffImpactNotifications(tariffCodeSetId);

    // Return immediately with success
    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
