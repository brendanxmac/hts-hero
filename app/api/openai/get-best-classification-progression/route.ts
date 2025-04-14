import { NextResponse, NextRequest } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { requesterIsAuthenticated } from "../../supabase/server";
import { SimplifiedHtsElement } from "../../../../interfaces/hts";

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
      ({ description }, i) => `${i}: ${description}`
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
      model: "gpt-4o-2024-11-20",
      response_format: responseFormat,
      //   TODO: consider whether or not to generalize this to just ask for the next best string match... and not using so much classification language
      messages: [
        {
          role: "system",
          content: `You are a United States Harmonized Tariff System Expert who follows the General Rules of Interpretation (GRI) for the Harmonized System perfectly.\n
          Your job is to determine which description from a list would most accurately match a product description if it were added onto the end of the current classification description.\n
          The current classification description might not be provided, in which case just compare directly against the product description.\n
          If the product description is provided it will be formatted is Parent > child > grandchild > etc.\n
          If only the top parent is in description, there will be no > symbols which indicate the hierarchy.\n
          Finally, you must pick one description. If you are unsure and "Other:" is available as an option, you should pick it.\n
            ${
              isTestEnv
                ? "The 0-based index of the best option must be included in your response\n"
                : "The logic you used to pick the best option based on the GRI must be included in your response, and so should the index (0 based) and description of the best option.\n"
            }
            `,
        },
        {
          role: "user",
          content: `Product Description: ${productDescription}\n
          ${
            htsDescription
              ? `Current Classification Description: ${htsDescription}\n`
              : ""
          }
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
