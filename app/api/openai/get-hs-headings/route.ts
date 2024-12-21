import { NextResponse, NextRequest } from "next/server";
import OpenAI from "openai";
import { OpenAIModel } from "../../../../libs/openai";
import { createClient } from "../../../../libs/supabase/server";

export const dynamic = "force-dynamic";

interface GetHtsHeadingsDto {
  productDescription: string;
  model?: OpenAIModel;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    // User who are not logged in can't make a gpt requests
    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to complete this action" },
        { status: 401 }
      );
    }

    const { productDescription, model }: GetHtsHeadingsDto = await req.json();

    if (!productDescription) {
      return NextResponse.json(
        { error: "Missing product description" },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const gptResponse = await openai.chat.completions.create({
      temperature: 0.7,
      top_p: 1.0,
      model: model || OpenAIModel.FOUR_MINI,
      messages: [
        {
          role: "system",
          content:
            "You are ChatGPT, a large language model trained by OpenAI. Answer as helpfully and accurately as possible.",
        },
        {
          role: "user",
          content: `Use the General Rules for the Interpretation of the Harmonized System to determine which headings (at least 2) most accurately describe: ${productDescription}.
        Your response should:
        1. Be ONLY a raw array of objects where each object matches the following structure: { heading: "xxxx",  desciption: 'lorem ipsum...', logic: 'the reason why this heading makes sense...'}.
        2. Without the code block formatting indicating it is json`,
        },
      ],
    });

    return NextResponse.json(gptResponse.choices);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
