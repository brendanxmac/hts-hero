import { NextResponse, NextRequest } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { createClient } from "../../../../libs/supabase/server";

export const dynamic = "force-dynamic";

interface GetBestDescriptionMatchDto {
  descriptions: string[];
  productDescription: string;
  isSectionOrChapter?: boolean;
  minMatches?: number;
  maxMatches?: number;
}

const DescriptionMatch = z.object({
  index: z.number(),
  description: z.string(),
  logic: z.string(),
});

const BestDescriptionMatches = z.object({
  bestCandidates: z.array(DescriptionMatch),
});

const getMinMaxRangeText = (minMatches?: number, maxMatches?: number) => {
  if (minMatches && maxMatches) {
    if (minMatches > maxMatches || minMatches === maxMatches) {
      throw new Error("Min matches must be less than max matches");
    }

    return `at least ${minMatches}, up to ${maxMatches}`;
  }

  if (minMatches) {
    return `at least ${minMatches}`;
  }

  if (maxMatches) {
    if (maxMatches === 1) {
      return "only 1";
    }
    return `up to ${maxMatches}`;
  }

  return "at least 1, up to 3";
};

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
      isSectionOrChapter = false,
      minMatches,
      maxMatches,
    }: GetBestDescriptionMatchDto = await req.json();

    if (!descriptions || !productDescription) {
      return NextResponse.json(
        {
          error: "Missing classification descriptions or product description",
        },
        { status: 400 }
      );
    }

    if (minMatches && maxMatches) {
      if (minMatches > maxMatches || minMatches === maxMatches) {
        return NextResponse.json(
          { error: "Min matches must be less than max matches" },
          { status: 400 }
        );
      }
    }

    const minMaxRangeText = getMinMaxRangeText(minMatches, maxMatches);

    const labelledDescriptions = descriptions.map(
      (description, index) => `${index}. ${description}`
    );

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const gptResponse = await openai.chat.completions.create({
      temperature: 0.2,
      model: "gpt-4o-2024-11-20",
      response_format: zodResponseFormat(
        BestDescriptionMatches,
        "best_description_matches",
        {
          description:
            "Used to get the best description matches from an array with selection logic included",
        }
      ),
      messages: [
        {
          role: "system",
          content: `You are a United States Harmonized Tariff System Expert who follows the General Rules of Interpretation (GRI) for the Harmonized System perfectly.\n
            Your job is to take a product description and a list of classification descriptions, and figure out which description(s) from the list most closely fit the product description (${minMaxRangeText}).\n
            ${
              isSectionOrChapter
                ? ""
                : "You must use the GRI rules sequentially (as needed) and consider all options in the list to shape your decision making logic.\n"
            }
            The logic you used to pick an option as a good candidate must be included in your response, and so should the original unchanged description.\n
            The best fitting candidate must be first in the list, and if none are good candidates, return an empty array.
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
