import { NextResponse, NextRequest } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { requesterIsAuthenticated } from "../../supabase/server";
import { SimplifiedHtsElement } from "../../../../interfaces/hts";
import { OpenAIModel } from "../../../../libs/openai";

export const dynamic = "force-dynamic";

interface GetBestClassificationProgressionDto {
  elements: SimplifiedHtsElement[];
  productDescription: string;
  htsDescription: string;
}

const TestBestProgression = z.object({
  index: z.number(),
});

const BestProgression = z.object({
  index: z.number(),
  description: z.string(),
  logic: z.string(),
  // questions: z.optional(z.array(z.string())),
});

export async function POST(req: NextRequest) {
  try {
    const requesterIsAllowed = await requesterIsAuthenticated(req);

    // Users who are not logged in can't make a gpt requests
    if (!requesterIsAllowed) {
      return NextResponse.json(
        { error: "You must be logged in to complete this action" },
        { status: 401 }
      );
    }

    const {
      elements,
      productDescription,
      htsDescription,
    }: GetBestClassificationProgressionDto = await req.json();

    if (!elements || !productDescription) {
      return NextResponse.json(
        {
          error: "Missing descriptions or product description",
        },
        { status: 400 }
      );
    }

    const labelledDescriptions = elements.map(
      ({ description }, i) => `${i + 1}: ${description}`
    );

    const isTestEnv = process.env.APP_ENV === "test";
    const responseFormatOptions = {
      description:
        "Used to find the best next classification progression in the Harmonized Tariff System for a product description and the current classification description",
    };
    const responseFormat = isTestEnv
      ? zodResponseFormat(
          TestBestProgression,
          "test_best_progression",
          responseFormatOptions
        )
      : zodResponseFormat(
          BestProgression,
          "best_classification_progression",
          responseFormatOptions
        );

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const gptResponse = await openai.chat.completions.create({
      temperature: 0,
      model: OpenAIModel.FOUR_ONE,
      response_format: responseFormat,
      // In your response, "questions" is optional, and should only have questions about the product that would help make a better decision between the options, if answered.\n
      messages: [
        {
          role: "system",
          content: `Your job is to determine which description from the list would most accurately match the item description if it were added onto the end of the current description.\n
          If the current description is not provided just determine which description best matches the item description itself.\n
          If two or more options all sound like they could be a good fit, you should pick the one that is the most specific, for example if the item description is "jeans" and the options are "cotton fabric" and "trousers", you should pick "trousers" because it is more specific.\n
          You must pick a single description. If option sounds suitable and "Other" is available as an option, you should pick it.\n
          Note: The use of semicolons (;) in the descriptions should be interpreted as "or" for example "mangoes;mangosteens" would be interpreted as "mangoes or mangosteens".\n
          In your response, "logic" for your selection should explain why the description you picked is the most suitable match.\n
          You should refer to the selected option as "this option" instead of writing out the option description, truncate the descriptions of the others options if beyond 30 characters if mentioned, and the item description itself should be always be referred to as "item description".\n
            ${isTestEnv && "The index of the best option must be included in your response\n"}`,
        },
        {
          role: "user",
          content: `Item Description: ${productDescription}\n
          ${htsDescription ? `Current Description: ${htsDescription}\n` : ""}
          Descriptions:\n ${labelledDescriptions.join("\n")}`,
        },
      ],
    });

    return NextResponse.json(gptResponse.choices);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
