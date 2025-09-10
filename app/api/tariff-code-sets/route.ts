import { NextResponse } from "next/server";
import { createClient } from "../supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    // User who are not logged in can't do searches
    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to complete this action." },
        { status: 401 }
      );
    }

    const { data: tariffCodeSets, error } = await supabase
      .from("tariff_code_sets")
      .select("*")
      .order("effective_at", { ascending: false });

    if (error) {
      console.error("Error fetching tariff code sets:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(tariffCodeSets, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
