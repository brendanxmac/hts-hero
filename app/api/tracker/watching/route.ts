import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/app/api/supabase/server";
import { Countries } from "@/constants/countries";
import { canonicalHtsCode } from "@/libs/hts-code";
import { findRateElement, formatSummaryDate, htsProductName } from "@/libs/hts-duty-summary";
import { MICRO_CUSTOMS_VALUE, microEstimate, microInput } from "@/libs/hts-micro-estimate";
import { getHtsElementByCode, getHtsElementParentsServer, getHtsElementsServer } from "@/libs/hts-server";
import { sendTransactional } from "@/libs/email/outbox";
import { AllRules } from "@/tariffs/engine-v2/data";
import { todayIsoDate } from "@/tariffs/engine-v2/dates";
import { addDays, calculateHistory, lastScheduledChange } from "@/tariffs/engine-v2/history";
import { getVerifiedRevisions } from "@/tariffs/engine-v2/revisions";

export const dynamic = "force-dynamic";

// The "You're watching" email (emails/onboarding/WatchingEmail.tsx): asked for by the arrival
// panel on an import's first visit from Get Alerts or Stop Overpaying (ArrivalPanel), for the
// signed-in account. Sent at once (it confirms what they just did), once per import, at most
// DAILY_LIMIT a day, with the import's duty today, its last change and the next one announced.

const DAILY_LIMIT = 5;
const pct = (amount: number) => Math.round((amount / MICRO_CUSTOMS_VALUE) * 10000) / 100;

export async function POST(req: Request) {
  const {
    data: { user },
  } = await createClient().auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "Sign in first" }, { status: 401 });

  const body = (await req.json().catch((): null => null)) as { productKey?: unknown } | null;
  const productKey = typeof body?.productKey === "string" ? body.productKey : "";
  const match = /^(\d{8}|\d{10})-([A-Z]{2})$/.exec(productKey);
  const htsno = match ? canonicalHtsCode(match[1]) : null;
  const country = match ? Countries.find((c) => c.code === match[2]) : undefined;
  if (!htsno || !country) return NextResponse.json({ error: "Unknown import" }, { status: 400 });

  const db = createAdminClient();
  try {
    // Once per import, and not more than a few a day
    const { data: sent, error: sentError } = await db
      .from("email_messages")
      .select("props, created_at")
      .eq("user_id", user.id)
      .eq("template", "watching")
      .order("created_at", { ascending: false })
      .limit(50);
    if (sentError) throw sentError;
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    if ((sent ?? []).some((m) => (m.props as { productKey?: string } | null)?.productKey === productKey)) {
      return NextResponse.json({ status: "already_sent" });
    }
    if ((sent ?? []).filter((m) => Date.parse(m.created_at) > dayAgo).length >= DAILY_LIMIT) {
      return NextResponse.json({ status: "limit" });
    }

    const elements = await getHtsElementsServer();
    const element = getHtsElementByCode(htsno, elements);
    if (!element) return NextResponse.json({ error: "Unknown import" }, { status: 400 });
    const parents = getHtsElementParentsServer(element, elements);
    const rateElement = findRateElement(element, parents);
    const today = todayIsoDate();
    const input = {
      htsCode: element.htsno,
      baseRates: { general: rateElement.general, special: rateElement.special, other: rateElement.other },
      country: country.code,
      asOf: today,
    };
    const estimate = microEstimate(input);

    // Every change to the total from the first verified date to the last one already announced
    const since = getVerifiedRevisions()[0]?.from ?? today;
    const scheduled = lastScheduledChange(AllRules, today, 90);
    const segments = calculateHistory(AllRules, microInput(input), since, addDays(scheduled ?? today, 1));
    const moves = segments.slice(1).flatMap((s, i) => {
      const beforePct = pct(segments[i].result.totalDuty);
      const afterPct = pct(s.result.totalDuty);
      return beforePct === afterPct ? [] : [{ date: s.from, beforePct, afterPct }];
    });
    const past = moves.filter((m) => m.date <= today);
    const last = past[past.length - 1];
    const next = moves.find((m) => m.date > today);
    const dated = (m: { date: string; beforePct: number; afterPct: number } | undefined) =>
      m ? { date: formatSummaryDate(m.date), beforePct: m.beforePct, afterPct: m.afterPct } : null;

    await sendTransactional(db, {
      recipient: user.email,
      userId: user.id,
      template: "watching",
      props: {
        productKey,
        htsno: element.htsno,
        productName: htsProductName(element, parents),
        country: country.name,
        path: `/tariff-tracker?tab=catalog&product=${encodeURIComponent(productKey)}`,
        dutyPct: pct(estimate.totalDuty),
        asOf: formatSummaryDate(today),
        last: dated(last),
        next: dated(next),
        since: formatSummaryDate(since),
        footer: { reason: "You're getting this because you started watching an import on htshero.com." },
      },
    });
    return NextResponse.json({ status: "sent" });
  } catch (e) {
    console.error("Sending the watching email:", e);
    return NextResponse.json({ error: "Couldn't send it" }, { status: 500 });
  }
}
