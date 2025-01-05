import { NextResponse, NextRequest } from "next/server";
import OpenAI from "openai";
import { OpenAIModel } from "../../../../libs/openai";
import { createClient } from "../../../../libs/supabase/server";

export const dynamic = "force-dynamic";

interface GetBestDescriptionMatchDto {
  htsDescription: string;
  descriptions: string[];
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
        { error: "You must be logged in to complete this action." },
        { status: 401 }
      );
    }

    const {
      htsDescription,
      descriptions,
      productDescription,
      model,
    }: GetBestDescriptionMatchDto = await req.json();

    if (htsDescription === undefined || !descriptions || !productDescription) {
      return NextResponse.json(
        {
          error:
            "Missing current hts description, descriptions to compare against, or product description",
        },
        { status: 400 }
      );
    }

    const labelledDescriptions = descriptions.map(
      (description, index) => `${index}. ${description}`
    );

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
          content: `For the given description: ${htsDescription}\n
        If one of the following descriptions were added onto it, which one, would most accurately classify / describe a ${productDescription}:\n
        ${labelledDescriptions.join("\n")}\n
        Your response should:
        1. Be ONLY a raw JSON response with two properties: 
        a. index: The number of the best option above (without the '.' included, for example "3." should just be "3")
        b. logic: your reasoning for WHY you chose this string
        2. Not contain the code block formatting indicating it is json`,
        },
      ],
    });

    return NextResponse.json(gptResponse.choices);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
