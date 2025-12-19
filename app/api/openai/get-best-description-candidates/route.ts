import { NextResponse, NextRequest } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { requesterIsAuthenticated } from "../../supabase/server";
import { getMinMaxRangeText } from "../../../../utilities/data";
import { OpenAIModel } from "../../../../libs/openai";

export const dynamic = "force-dynamic";

interface GetBestDescriptionMatchDto {
  descriptions: string[];
  productDescription: string;
  isSectionOrChapter?: boolean;
  temperature: number;
  minMatches?: number;
  maxMatches?: number;
}

const TestDescriptionMatch = z.object({
  index: z.number(),
});

const TestBestDescriptionMatches = z.object({
  bestCandidates: z.array(TestDescriptionMatch),
});

const BestDescriptionMatches = z.object({
  bestCandidates: z.array(z.number()),
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
      descriptions,
      productDescription,
      isSectionOrChapter = false,
      temperature = 0.4,
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

    console.log("Min Max Range Text: ", minMaxRangeText);

    const labelledDescriptions = descriptions.map(
      (description, index) => `${index}. ${description}`
    );

    const isTestEnv = process.env.APP_ENV === "test";
    const responseFormatOptions = {
      description: "Used to get the best description matches from an array",
    };
    const responseFormat = isTestEnv
      ? zodResponseFormat(
          TestBestDescriptionMatches,
          "test_description_matches",
          responseFormatOptions
        )
      : zodResponseFormat(
          BestDescriptionMatches,
          "best_description_matches",
          responseFormatOptions
        );

    // You are a United States Harmonized Tariff System Expert who follows the General Rules of Interpretation (GRI) for the Harmonized System perfectly.\n
    //     Your job is to take an item description and a list of options, and figure out which options from the list are similar to the item description (${minMaxRangeText}).\n
    //     You must consider all options in the list to shape your decision making logic.\n
    //     When comparing semantic similarity, consider indirect, functional, and industry-based relationships, not only literal word overlap.
    //     Note: The use of semicolons (;) in the descriptions should be interpreted as "or" for example "mangoes;mangosteens" would be interpreted as "mangoes or mangosteens".\n
    //     If no options are clearly relevant, return the most plausible options with low confidence.

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const gptResponse = await openai.chat.completions.create({
      temperature,
      model: OpenAIModel.FIVE_ONE,
      response_format: responseFormat,
      messages: [
        {
          role: "system",
          content: `You are a United States Harmonized Tariff System expert who follows the General Rules of Interpretation (GRI).
          Your task is to evaluate semantic similarity between an item description and a list of HTS options.
          You are optimizing for recall, not precision, at this stage.
          False negatives are worse than false positives.
          You must consider ALL options in the list.
          When comparing similarity, consider indirect, functional, material, industry-based, and end-use relationships, not only literal word overlap.
          Some options may be weak or borderline matches but still plausible.
          If no options are clearly relevant, return the most plausible options rather than excluding everything.
          Pick ${minMaxRangeText} options.
          Note: Semicolons (;) in descriptions mean "or" (e.g., "mangoes;mangosteens" = "mangoes or mangosteens").
`,
        },
        {
          role: "user",
          content: `Item Description: ${productDescription}\n
         Options: ${labelledDescriptions.join("\n")}`,
        },
      ],
    });

    console.log({
      promptTokens: gptResponse.usage?.prompt_tokens,
      completionTokens: gptResponse.usage?.completion_tokens,
      totalTokens: gptResponse.usage?.total_tokens,
    });

    //     ${
    //   isTestEnv
    //     ? ""
    //     : "The logic you used to pick an option as a good candidate must be included in your response\n"
    // }

    return NextResponse.json(gptResponse.choices);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
