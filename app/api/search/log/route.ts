import { NextResponse, NextRequest } from "next/server";
import { createClient } from "../../supabase/server";

export const dynamic = "force-dynamic";

interface SearchTriggeredDto {
  productDescription: string;
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

    const { productDescription }: SearchTriggeredDto = await req.json();

    if (!productDescription) {
      return NextResponse.json(
        {
          error: "Missing product description",
        },
        { status: 400 }
      );
    }

    const { error, data: insertResponse } = await supabase
      .from("search")
      .insert([{ user_id: user.id, product_description: productDescription }]);

    console.log("Log Search Response:");
    console.log(insertResponse);

    if (error) {
      console.error("Error logging search:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
