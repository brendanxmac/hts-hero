import { NextResponse, NextRequest } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { createClient } from "../../../../libs/supabase/server";

export const dynamic = "force-dynamic";

interface RankDescriptionsDto {
  descriptions: string[];
  productDescription: string;
  isSectionOrChapter?: boolean;
}

const DescriptionRanking = z.object({
  index: z.number(),
  rank: z.number(),
  description: z.string(),
  logic: z.string(),
});

const DescriptionRankings = z.object({
  rankedDescriptions: z.array(DescriptionRanking),
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

    const { descriptions, productDescription }: RankDescriptionsDto =
      await req.json();

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

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const gptResponse = await openai.chat.completions.create({
      temperature: 0.3,
      model: "gpt-4o-2024-11-20",
      response_format: zodResponseFormat(
        DescriptionRankings,
        "description_rankings",
        {
          description:
            "Used to rank the best HTS heading description matches against a product description with ranking logic that references the GRI considering all other descriptions included",
        }
      ),
      messages: [
        // TODO: Consider how the GRI sentance might need to be changed to
        // fit the differenct contexts in which the prompt is called
        // For example... do we need to use the GRI for section and chapter...?
        {
          role: "system",
          content: `You are a United States Harmonized Tariff System Expert who follows the General Rules of Interpretation (GRI) for the Harmonized System perfectly.\n
            Your job is to take a product description and a list of HTS Heading descriptions, and rank the descriptions using the GRI based on how well each matches the product description against all other descriptions included.\n
            "You must use the GRI rules (in sequential order as needed) and consider all options in the list to shape your decision making logic.\n"
            The index of the description, it's rank, the logic used to rank it, and the original unchanged description should be included in your response.\n
            The response list should be ordered by the rank, with the best ranking description first, and the worst last.
            `,
        },
        {
          role: "user",
          content: `Product Description: ${productDescription}\n
         HTS Heading Descriptions: ${labelledDescriptions.join("\n")}`,
        },
      ],
    });

    return NextResponse.json(gptResponse.choices);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
