"use server";

import { NextResponse, NextRequest } from "next/server";
import { createClient } from "../../supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { PricingPlan } from "../../../../types/config";
import { TariffCodeSet } from "../../../../tariffs/announcements/announcements";
import { HtsCodeSet } from "../../../../interfaces/hts";
import { codeIsIncludedInTariffCodeSet } from "../../../../libs/tariff-impact-check";
import { fetchUsers } from "../../../../libs/supabase/user";
import { sendTariffImpactCheckResultsEmail } from "../../../../emails/tariff-impact/tariff-impact-check-results-email";
import { sendEmails } from "../../../../libs/resend";
import { CreateEmailOptions } from "resend";
import config from "../../../../config";
import ImpactedByNewTariffsEmail from "../../../../emails/ImpactedByNewTariffs";
import React from "react";

const requesterIsAdmin = (req: NextRequest) => {
  const serverApiKey = process.env.SERVER_ADMIN_API_KEY;
  const requestApiKey = req.headers.get("x-api-key");

  return requestApiKey || requestApiKey === serverApiKey;
};

const fetchActiveTariffImpactPurchases = async (supabase: SupabaseClient) => {
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

const fetchCodeSetsForUser = async (
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

const fetchTariffCodeSet = async (supabase: SupabaseClient, id: string) => {
  const { data: codeSet, error } = await supabase
    .from("tariff_code_sets")
    .select("*")
    .eq("id", id)
    .single<TariffCodeSet>();

  if (error) {
    console.error(`Failed to tariff code set with id: ${id}`, error);
    throw new Error(`Failed to fetch tariff code set with id: ${id}`);
  }

  return codeSet;
};

// Helper function to prepare email data for bulk sending
const createTariffImpactEmail = (
  maybeAffected: boolean = true,
  recipient: string,
  tariffCodeSet: TariffCodeSet,
  userHtsCodeSet: HtsCodeSet,
  affectedImportsCount: number,
  note?: string
): CreateEmailOptions => {
  const subjectPrefix = maybeAffected
    ? "🚨 New Tariffs Might Affect"
    : "🚨 New Tariffs Affect";
  return {
    from: config.resend.fromAdmin,
    to: recipient,
    subject: `${subjectPrefix} ${affectedImportsCount} of your Imports`,
    react: React.createElement(ImpactedByNewTariffsEmail, {
      maybeAffected,
      tariffName: tariffCodeSet.name,
      userImportListName: userHtsCodeSet.name,
      affectedImportsCount,
      tariffCodeSetId: tariffCodeSet.id,
      htsCodeSetId: userHtsCodeSet.id,
      note,
    }),
    replyTo: "support@htshero.com",
  };
};

// maybeAffected indicates if there's not a 100% guarantee that the detected imports are affected

const processTariffImpactNotifications = async (
  tariffCodeSet: TariffCodeSet,
  maybeAffected: boolean = true,
  note?: string
) => {
  const errors: string[] = [];
  let processedUsers = 0;
  let processedCodeSets = 0;
  const emailsToSend: CreateEmailOptions[] = [];
  const startTime = Date.now();

  try {
    const supabase = createClient();

    console.log(
      `🚀 Starting tariff impact notification processing for: ${tariffCodeSet.name}`
    );
    console.log(`📅 Started at: ${new Date().toISOString()}`);

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
      `👥 Total users to process: ${usersWithTariffImpactPurchases.length}`
    );

    // Collect all emails to send
    for (const user of usersWithTariffImpactPurchases) {
      try {
        processedUsers++;
        const codeSets = await fetchCodeSetsForUser(supabase, user.id);

        console.log(
          `👤 Processing user ${processedUsers}/${usersWithTariffImpactPurchases.length}: ${user.id}`
        );

        // Process each codeSet for this user
        for (const codeSet of codeSets) {
          try {
            processedCodeSets++;
            const codesIncludedInTariffSet = codeSet.codes.filter((code) => {
              return codeIsIncludedInTariffCodeSet(code, tariffCodeSet);
            });

            if (codesIncludedInTariffSet.length > 0) {
              // Prepare email data instead of sending immediately
              const emailData = createTariffImpactEmail(
                maybeAffected,
                user.email,
                tariffCodeSet,
                codeSet,
                codesIncludedInTariffSet.length,
                note
              );
              emailsToSend.push(emailData);
            }
          } catch (codeSetError) {
            const errorMsg = `Failed to process codeSet ${codeSet.id} for user ${user.id}: ${codeSetError instanceof Error ? codeSetError.message : String(codeSetError)}`;
            errors.push(errorMsg);
            console.error(`❌ ${errorMsg}`, codeSetError);
          }
        }
      } catch (userError) {
        const errorMsg = `Failed to process user ${user.id} (${user.email}): ${userError instanceof Error ? userError.message : String(userError)}`;
        errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`, userError);
      }
    }

    console.log(`📊 Data collection completed:`);
    console.log(`   - Processed ${processedUsers} users`);
    console.log(`   - Processed ${processedCodeSets} code sets`);
    console.log(`   - Prepared ${emailsToSend.length} emails to send`);

    // Send all emails in bulk using the sendEmails function
    let emailsSent = 0;

    if (emailsToSend.length > 0) {
      console.log(`📧 Sending ${emailsToSend.length} emails in bulk...`);

      try {
        const results = await sendEmails(emailsToSend);

        // Count successful sends
        for (const result of results) {
          console.log("Processing batch result:", result);

          // Check if this is an error result (has error property with actual error)
          if ("error" in result && result.error) {
            const errorMsg = `Bulk email batch error: ${JSON.stringify(result.error)}`;
            errors.push(errorMsg);
            console.error("❌ Batch failed:", result.error);
          } else {
            // This is a successful batch result
            const batchResult = result as any;
            if (batchResult.data && Array.isArray(batchResult.data)) {
              const batchEmailsSent = batchResult.data.length;
              emailsSent += batchEmailsSent;
              console.log(
                `✅ Batch completed successfully: ${batchEmailsSent} emails sent`
              );
            } else {
              console.warn(
                "⚠️ Batch result missing expected data array:",
                batchResult
              );
            }
          }
        }

        console.log(
          `✅ Bulk email sending completed. Sent ${emailsSent} emails.`
        );
      } catch (bulkEmailError) {
        const errorMsg = `Failed to send bulk emails: ${bulkEmailError instanceof Error ? bulkEmailError.message : String(bulkEmailError)}`;
        errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`, bulkEmailError);
      }
    }

    const totalTime = Date.now() - startTime;

    // Log final processing summary
    console.log(`✅ Tariff impact notification processing completed:`);
    console.log(`   📊 Final Statistics:`);
    console.log(`   - Processed ${processedUsers} users`);
    console.log(`   - Processed ${processedCodeSets} code sets`);
    console.log(`   - Prepared ${emailsToSend.length} emails for sending`);
    console.log(
      `   - Successfully sent ${emailsSent}/${emailsToSend.length} emails (${emailsToSend.length > 0 ? Math.round((emailsSent / emailsToSend.length) * 100) : 0}%)`
    );
    console.log(`   - Encountered ${errors.length} errors`);
    console.log(
      `   ⏱️  Total processing time: ${Math.round(totalTime / 1000)}s`
    );

    if (errors.length > 0) {
      console.log(`❌ Errors encountered:`);
      errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
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
    console.error(`💥 ${errorMsg}`, error);
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
    const { tariffCodeSetId, maybeAffected, note } = body;

    if (!tariffCodeSetId || maybeAffected === undefined) {
      return NextResponse.json({ error: "Bad Request" }, { status: 400 });
    }

    // Validate that the tariff code set exists
    const supabase = createClient();
    const tariffCodeSet = await fetchTariffCodeSet(supabase, tariffCodeSetId);

    // Process emails
    await processTariffImpactNotifications(tariffCodeSet, maybeAffected, note);

    // Return immediately with success
    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
