import { NextResponse, NextRequest } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { requesterIsAuthenticated } from "../../supabase/server";
import { getMinMaxRangeText } from "../../../../utilities/data";
import { OpenAIModel } from "../../../../libs/openai";

export const dynamic = "force-dynamic";

interface CandidateWithReferencedCodes {
  description: string;
  referencedCodes?: Record<string, string>;
}

interface GetBestDescriptionMatchDto {
  candidates: CandidateWithReferencedCodes[];
  productDescription: string;
  isSectionOrChapter?: boolean;
  minMatches?: number;
  maxMatches?: number;
  descriptions?: string[];
}

const BestDescriptionMatches = z.object({
  bestCandidates: z.array(z.number()),
});

const getSystemPrompt = (
  isSectionOrChapter: boolean,
  minMaxRangeText: string
) => {
  if (isSectionOrChapter) {
    return `You are a United States Harmonized Tariff Schedule Expert.
Select the candidates that are similar to the Item Description (${minMaxRangeText}).\n
You MUST follow these rules:
1. Analyze every candidate one by one.
2. Your response must be an object with a "bestCandidates" property that is an array of the indexs of the best candidates.
3. If no candidates are reasonable or similar to the Item Description, return an empty array.\n
Note: The use of semicolons (;) in the descriptions should be interpreted as "or" for example "mangoes;mangosteens" would be interpreted as "mangoes or mangosteens".\n
`;
  } else {
    return `You are a United States Harmonized Tariff Schedule Expert.
Select the candidates that are similar to the Item Description (${minMaxRangeText}).\n
You MUST follow these rules:
1. Analyze every candidate one by one.
2. Some candidates include 'referenceCodes' which are other HTS elements referenced in the candidate's description. You must use these to understand what that specific candidate is referring to.
3. If the Item Description has the same essential character of the candidate, but is an incomplete, unfinished, or unassembled version of a candidate, it should be selected.
4. If a candidate refers to a material or substance and that material or substance is likely to be part of the Item described, it should be selected.
5. Your response must be an object with a "bestCandidates" property that is an array of the indexs of the best candidates.
6. If no candidates are reasonable or similar to the Item Description, return an empty array.\n
Note: The use of semicolons (;) in the descriptions should be interpreted as "or" for example "mangoes;mangosteens" would be interpreted as "mangoes or mangosteens".`;
  }
};

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
      candidates,
      productDescription,
      isSectionOrChapter = false,
      minMatches,
      maxMatches,
      descriptions,
    }: GetBestDescriptionMatchDto = await req.json();

    if (
      (!candidates && !isSectionOrChapter) ||
      !productDescription ||
      (!descriptions && isSectionOrChapter)
    ) {
      return NextResponse.json(
        {
          error: "Missing candidates or product description",
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

    // Remove 'referencedCodes' from candidates if it's empty or undefined
    const cleanedCandidates = candidates.map((candidate, i) => {
      // If referencedCodes is nullish or an empty object, remove the property
      if (
        !candidate.referencedCodes ||
        (typeof candidate.referencedCodes === "object" &&
          Object.keys(candidate.referencedCodes).length === 0)
      ) {
        // Use object destructuring to omit referencedCodes
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { referencedCodes, ...rest } = candidate;
        return { ...rest, index: i };
      }

      return { ...candidate, index: i };
    });

    if (candidates && candidates.length > 0) {
      console.log("🎯🎯 CANDIDATES");
      console.log(candidates);
    }

    const labelledDescriptions = descriptions?.map(
      (desc, i) => `${i}. ${desc}`
    );

    if (descriptions && descriptions.length > 0) {
      console.log("🎯🎯 DESCRIPTIONS");
      console.log(labelledDescriptions);
    }

    const minMaxRangeText = getMinMaxRangeText(minMatches, maxMatches);

    const systemPrompt = getSystemPrompt(isSectionOrChapter, minMaxRangeText);

    console.log("Prompt");
    console.log(systemPrompt);

    const responseFormatOptions = {
      description: "Used to get the best description matches from an array",
    };
    const responseFormat = zodResponseFormat(
      BestDescriptionMatches,
      "best_description_matches",
      responseFormatOptions
    );

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const gptResponse = await openai.chat.completions.create({
      temperature: 0.3,
      model: OpenAIModel.FIVE_ONE,
      response_format: responseFormat,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Item Description: ${productDescription}\n
         Candidates:\n ${isSectionOrChapter ? labelledDescriptions : JSON.stringify(cleanedCandidates, null, 2)}`,
        },
      ],
    });

    console.log("Best Description Candidates Tokens:");
    console.log({
      promptTokens: gptResponse.usage?.prompt_tokens,
      completionTokens: gptResponse.usage?.completion_tokens,
      totalTokens: gptResponse.usage?.total_tokens,
    });

    return NextResponse.json(gptResponse.choices);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
