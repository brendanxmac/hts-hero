import { NextResponse, NextRequest } from "next/server";
import { createClient } from "../../supabase/server";
import { validateTariffableHtsCode } from "../../../../libs/hts";
import { HtsCodeSet } from "../../../../interfaces/hts";

export const dynamic = "force-dynamic";

interface UpdateHtsCodeSetDto {
  id: string;
  htsCodes: string[];
}

export async function POST(req: NextRequest) {
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

    const { id, htsCodes }: UpdateHtsCodeSetDto = await req.json();

    if (!id || !htsCodes) {
      return NextResponse.json(
        {
          error: "Missing id or codes",
        },
        { status: 400 }
      );
    }

    const validatedHtsCodes = htsCodes.map((code) => {
      const { valid: isValidTariffableCode, error } =
        validateTariffableHtsCode(code);

      if (error) {
        throw new Error(error);
      }
      return isValidTariffableCode ? code : null;
    });

    const { error } = await supabase
      .from("hts_code_sets")
      .update({
        codes: validatedHtsCodes,
      })
      .eq("id", id)
      .select()
      .single<HtsCodeSet>();

    if (error) {
      console.error("Error updateing hts code set:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
