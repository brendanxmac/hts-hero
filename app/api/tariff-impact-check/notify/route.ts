"use server";

import { NextResponse, NextRequest } from "next/server";
import { createClient } from "../../supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { PricingPlan } from "../../../../types/config";
import { TariffCodeSet } from "../../../../tariffs/announcements/announcements";
import { HtsCodeSet } from "../../../../interfaces/hts";
import { codeIsIncludedInTariffCodeSet } from "../../../../libs/tariff-impact-check";
import { sendTariffImpactCheckEmail } from "../../../../emails/tariff-impact/tariff-impact-check-email";
import { fetchUsers } from "../../../../libs/supabase/user";
import { sendTariffImpactCheckResultsEmail } from "../../../../emails/tariff-impact/tariff-impact-check-results-email";

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
      PricingPlan.TARIFF_IMPACT_STARTER,
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

// Helper function to add delay between email sends
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const processTariffImpactNotifications = async (
  tariffCodeSet: TariffCodeSet
) => {
  const errors: string[] = [];
  let processedUsers = 0;
  let processedCodeSets = 0;
  let emailsSent = 0;
  let totalUsersToProcess = 0;
  let totalCodeSetsToProcess = 0;
  let totalEmailsToSend = 0;
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

    totalUsersToProcess = usersWithTariffImpactPurchases.length;
    console.log(`👥 Total users to process: ${totalUsersToProcess}`);

    // Pre-calculate total code sets and potential emails for progress tracking
    for (const user of usersWithTariffImpactPurchases) {
      try {
        const codeSets = await fetchCodeSetsForUser(supabase, user.id);
        totalCodeSetsToProcess += codeSets.length;

        // Count potential emails
        for (const codeSet of codeSets) {
          const codesIncludedInTariffSet = codeSet.codes.filter((code) => {
            return codeIsIncludedInTariffCodeSet(code, tariffCodeSet);
          });
          if (codesIncludedInTariffSet.length > 0) {
            totalEmailsToSend++;
          }
        }
      } catch (error) {
        console.warn(
          `⚠️ Failed to pre-calculate for user ${user.id}: ${error}`
        );
      }
    }

    console.log(`📊 Processing estimates:`);
    console.log(`   - Total code sets: ${totalCodeSetsToProcess}`);
    console.log(`   - Estimated emails to send: ${totalEmailsToSend}`);
    console.log(
      `   - Estimated processing time: ${Math.ceil(totalEmailsToSend * 0.8)} seconds`
    );

    // Process each user with error handling and rate limiting
    for (const user of usersWithTariffImpactPurchases) {
      try {
        processedUsers++;
        const codeSets = await fetchCodeSetsForUser(supabase, user.id);

        console.log(
          `👤 Processing user ${processedUsers}/${totalUsersToProcess}: ${user.id}`
        );

        // Process each codeSet for this user with error handling
        for (const codeSet of codeSets) {
          try {
            processedCodeSets++;
            const codesIncludedInTariffSet = codeSet.codes.filter((code) => {
              return codeIsIncludedInTariffCodeSet(code, tariffCodeSet);
            });

            if (codesIncludedInTariffSet.length > 0) {
              try {
                // Add delay before sending email (rate limiting)
                if (emailsSent > 0) {
                  await delay(800); // 800ms delay between emails
                }

                await sendTariffImpactCheckEmail(
                  user.email,
                  tariffCodeSet,
                  codeSet,
                  codesIncludedInTariffSet.length
                );
                emailsSent++;

                // Log progress every 10 emails or at milestones
                if (emailsSent % 10 === 0 || emailsSent === totalEmailsToSend) {
                  const elapsed = Date.now() - startTime;
                  const avgTimePerEmail = elapsed / emailsSent;
                  const remainingEmails = totalEmailsToSend - emailsSent;
                  const estimatedRemainingTime = Math.ceil(
                    (remainingEmails * avgTimePerEmail) / 1000
                  );

                  console.log(
                    `📧 Email progress: ${emailsSent}/${totalEmailsToSend} sent (${Math.round((emailsSent / totalEmailsToSend) * 100)}%)`
                  );
                  console.log(
                    `⏱️  Elapsed: ${Math.round(elapsed / 1000)}s, ETA: ${estimatedRemainingTime}s`
                  );
                }
              } catch (emailError) {
                const errorMsg = `Failed to send email to user ${user.id} (${user.email}) for codeSet ${codeSet.id}: ${emailError instanceof Error ? emailError.message : String(emailError)}`;
                errors.push(errorMsg);
                console.error(`❌ ${errorMsg}`, emailError);
              }
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

    const totalTime = Date.now() - startTime;
    const avgTimePerEmail = emailsSent > 0 ? totalTime / emailsSent : 0;

    // Log final processing summary
    console.log(`✅ Tariff impact notification processing completed:`);
    console.log(`   📊 Final Statistics:`);
    console.log(
      `   - Processed ${processedUsers}/${totalUsersToProcess} users (${Math.round((processedUsers / totalUsersToProcess) * 100)}%)`
    );
    console.log(
      `   - Processed ${processedCodeSets}/${totalCodeSetsToProcess} code sets (${Math.round((processedCodeSets / totalCodeSetsToProcess) * 100)}%)`
    );
    console.log(
      `   - Sent ${emailsSent}/${totalEmailsToSend} emails (${Math.round((emailsSent / totalEmailsToSend) * 100)}%)`
    );
    console.log(`   - Encountered ${errors.length} errors`);
    console.log(
      `   ⏱️  Total processing time: ${Math.round(totalTime / 1000)}s`
    );
    console.log(
      `   📈 Average time per email: ${Math.round(avgTimePerEmail)}ms`
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
    const { tariffCodeSetId } = body;

    if (!tariffCodeSetId) {
      return NextResponse.json({ error: "Bad Request" }, { status: 400 });
    }

    // Validate that the tariff code set exists
    const supabase = createClient();
    const tariffCodeSet = await fetchTariffCodeSet(supabase, tariffCodeSetId);

    // Start processing asynchronously (don't await)
    processTariffImpactNotifications(tariffCodeSet);

    // Return immediately with success
    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
