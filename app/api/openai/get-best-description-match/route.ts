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

    console.log(labelledDescriptions);

    const bestDescriptionMatch = z.object({
      index: z.number(),
      logic: z.string(),
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
        bestDescriptionMatch,
        "best_description_match",
        {
          description:
            "Used to the best new description match can be extracted from an array with selection logic included",
        }
      ),
      messages: [
        {
          role: "system",
          content: `You are a United States Harmonized Tariff System Expert who follows the General Rules for the Interpretation (GRI) of the Harmonized System perfectly.
            Your job is to take a product description, a work-in-progress HTS classification, and a list of the next classification level descriptions, and figure out which description from the list would best match the product descriptions using the GRI if it was added onto the work-in-progress classification.
            The logic you used to pick the selected option over the other candidates with reference to the GRI rule used to make the decision should be included in the "logic" property of the response 
            `,
        },
        {
          role: "user",
          content: `Product Description: ${productDescription}\n
          Work In Progress HTS Classification: ${htsDescription}\n
        Next Classification Level Descriptions: ${labelledDescriptions.join(
          "\n"
        )}`,
        },
      ],
    });

    return NextResponse.json(gptResponse.choices);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
