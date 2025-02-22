import { NextResponse, NextRequest } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { createClient } from "../../../../libs/supabase/server";
import { SimplifiedHtsElement } from "../../../../interfaces/hts";

export const dynamic = "force-dynamic";

interface GetBestClassificationProgressionDto {
  elements: SimplifiedHtsElement[];
  productDescription: string;
  htsDescription: string;
}

const BestProgression = z.object({
  code: z.string(),
  description: z.string(),
  logic: z.string(),
});

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
      elements,
      productDescription,
      htsDescription,
    }: GetBestClassificationProgressionDto = await req.json();

    console.log("Elements:", elements);
    console.log("Product Description:", productDescription);
    console.log("HTS Description:", htsDescription);

    if (!elements || !productDescription || !htsDescription) {
      return NextResponse.json(
        {
          error:
            "Missing descriptions, product description, or hts description",
        },
        { status: 400 }
      );
    }

    const labelledDescriptions = elements.map(
      ({ code, description }) => `${code}. ${description}`
    );

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const gptResponse = await openai.chat.completions.create({
      temperature: 0.2,
      model: "gpt-4o-2024-11-20",
      response_format: zodResponseFormat(
        BestProgression,
        "best_classification_progression",
        {
          description:
            "Used to find the best next classification progression in the Harmonized Tariff System for a product description and the current classification description",
        }
      ),
      //   TODO: consider whether or not to generalize this to just ask for the next best string match... and not using so much classification language
      messages: [
        {
          role: "system",
          content: `You are a United States Harmonized Tariff System Expert who follows the General Rules of Interpretation (GRI) for the Harmonized System perfectly.\n
            Your job is to take a product description, the current classification description (in the format of "[Heading Description] > [Subheading Description] > etc...)", 
            and a list of the descriptions at the next level of classification, and figure out which description from the list best fits the product description if it were added onto the current classification description.\n
            You must use the GRI rules sequentially (as needed) and consider all descriptions in the list to make your decision.\n
            The logic you used to pick the best option based on the GRI must be included in your response, and so should the code and description of the best option.\n
            `,
        },
        {
          role: "user",
          content: `Product Description: ${productDescription}\n
          Current Classification Description: ${htsDescription}\n
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
