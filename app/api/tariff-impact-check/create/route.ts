import { NextResponse, NextRequest } from "next/server";
import { createClient } from "../../supabase/server";
import { validateTariffableHtsCode } from "../../../../libs/hts";
import { TariffImpactCheck } from "../../../../interfaces/tariffs";

export const dynamic = "force-dynamic";

interface CreateTariffImpactCheckDTO {
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

    const { htsCodes }: CreateTariffImpactCheckDTO = await req.json();

    console.log("htsCodes", htsCodes);

    if (!htsCodes) {
      return NextResponse.json(
        {
          error: "HTS Codes not provided",
        },
        { status: 400 }
      );
    }

    const validatedHtsCodes = htsCodes.map((code) => {
      const { valid: isValidTariffableCode, error } =
        validateTariffableHtsCode(code);

      if (error) {
        console.error(`Invalid HTS Code in Tariff Check: ${code}`, error);
      }
      return isValidTariffableCode ? code : null;
    });

    const { data: tariffImpactCheck, error } = await supabase
      .from("tariff_impact_checks")
      .insert([
        {
          user_id: user.id,
          codes: validatedHtsCodes,
        },
      ])
      .select()
      .single<TariffImpactCheck>();

    if (error) {
      console.error("Error creating tariff impact check:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(tariffImpactCheck, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
