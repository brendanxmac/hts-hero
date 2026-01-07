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
}

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
      candidates,
      productDescription,
      isSectionOrChapter = false,
      minMatches,
      maxMatches,
    }: GetBestDescriptionMatchDto = await req.json();

    if (!candidates || !productDescription) {
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

    console.log("🎯🎯 CANDIDATES");
    console.log(candidates);

    const minMaxRangeText = getMinMaxRangeText(minMatches, maxMatches);

    // Build labelled candidates with their referencedCodes inline
    const labelledCandidates = candidates.map((candidate, index) => {
      const hasReferencedCodes =
        candidate.referencedCodes &&
        Object.keys(candidate.referencedCodes).length > 0;

      if (hasReferencedCodes) {
        const refsText = Object.entries(candidate.referencedCodes!)
          .map(([code, desc]) => `${code}: ${desc}`)
          .join("; ");
        return `${index}. ${candidate.description} [Referenced Codes: ${refsText}]`;
      }

      return `${index}. ${candidate.description}`;
    });

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
          content: `You are a United States Harmonized Tariff System Expert.\n
            Your job is to take an "Item Description" and a list of "Candidates", and figure out which candidates are vaguely related to the "Item Description" (${minMaxRangeText}).\n
            You must consider all candidates in the list to shape your decision making logic.\n
            ${isSectionOrChapter ? "" : "Some candidates include 'referenceCodes', which are the HTS codes referenced in the candidate's description. You must use these to help understand what that specific candidate is referring to.\n"}
            Note: The use of semicolons (;) in the descriptions should be interpreted as "or" for example "mangoes;mangosteens" would be interpreted as "mangoes or mangosteens".\n
            If there are no good candidates, return an empty array.
            `,
        },
        {
          role: "user",
          content: `Item Description: ${productDescription}\n
         Candidates: ${labelledCandidates.join("\n")}\n`,
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
