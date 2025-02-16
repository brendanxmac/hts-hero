import { NextResponse, NextRequest } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
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
      descriptions,
      productDescription,
      model,
    }: GetBestDescriptionMatchDto = await req.json();

    if (!descriptions || !productDescription) {
      return NextResponse.json(
        {
          error:
            "Missing descriptions to compare against or the product description",
        },
        { status: 400 }
      );
    }

    const labelledDescriptions = descriptions.map(
      (description, index) => `${index}. ${description}`
    );

    console.log(labelledDescriptions);

    const DescriptionMatch = z.object({
      index: z.number(),
      description: z.string(),
      logic: z.string(),
    });

    const bestDescriptionMatches = z.object({
      bestCandidates: z.array(DescriptionMatch),
    });

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    // const gptResponse = await openai.chat.completions.create({
    //   temperature: 0.7,
    //   top_p: 1.0,
    //   model: model || OpenAIModel.FOUR_MINI,
    //   messages: [
    //     {
    //       role: "system",
    //       content: "You are ChatGPT, a large language model trained by OpenAI. Answer as helpfully and accurately as possible.",
    //     },
    //     {
    //       role: "user",
    //       content: `For the given description: ${htsDescription}\n
    //     If one of the following descriptions were added onto it, which one would most accurately classify / describe a ${productDescription}:\n
    //     ${labelledDescriptions.join("\n")}\n
    //     Your response should:
    //     1. Be ONLY a raw JSON response with two properties:
    //     a. index: The number of the best option above (without the '.' included, for example "3." should just be "3")
    //     b. logic: your reasoning for WHY you chose this string
    //     2. Not contain the code block formatting indicating it is json`,
    //     },
    //   ],
    // });
    const gptResponse = await openai.chat.completions.create({
      temperature: 0.3,
      model: "gpt-4o-2024-11-20",
      response_format: zodResponseFormat(
        bestDescriptionMatches,
        "best_description_matches",
        {
          description:
            "Used to get the best description matches from an array with selection logic included",
        }
      ),
      messages: [
        // TODO: Consider how the GRI sentance might need to be changed to
        // fit the differenct contexts in which the prompt is called
        // For example... do we need to use the GRI for section and chapter...?
        {
          role: "system",
          content: `You are a United States Harmonized Tariff System Expert who follows the General Rules of Interpretation (GRI) for the Harmonized System perfectly.\n
            Your job is to take a product description and a list of classification descriptions, and figure out which descriptions from the list (at least 2, up to 3) best match the product description.\n
            You must use the GRI rules sequentially (as needed) and consider all options in the list as to shape your decision making logic.\n
            The logic you used to pick an option as a good candidate must be included in your response, and so should the original description which should be completely unchanged.
            `,
        },
        {
          role: "user",
          content: `Product Description: ${productDescription}\n
         Classification Descriptions: ${labelledDescriptions.join("\n")}`,
        },
      ],
    });

    return NextResponse.json(gptResponse.choices);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
