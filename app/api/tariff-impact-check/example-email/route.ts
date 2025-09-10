import { NextResponse, NextRequest } from "next/server";
import { createClient } from "../../supabase/server";
import { sendTariffImpactCheckExampleEmail } from "../../../../emails/tariff-impact/tariff-impact-check-example-email";

export const dynamic = "force-dynamic";

interface SendExampleImpactNotificationEmailDto {
  email: string;
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

    const { email }: SendExampleImpactNotificationEmailDto = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    if (user.email !== email) {
      console.error(
        `User email: ${user.email} does not match request email: ${email}`
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await sendTariffImpactCheckExampleEmail(email);

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
