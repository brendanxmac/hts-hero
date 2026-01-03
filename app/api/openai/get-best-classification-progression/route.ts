import { NextResponse, NextRequest } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { requesterIsAuthenticated } from "../../supabase/server";
import { SimplifiedHtsElement } from "../../../../interfaces/hts";
import {
  getBestClassificationProgressionPremium,
  getBestClassificationProgressionStandard,
  OpenAIModel,
} from "../../../../libs/openai";
import { ClassificationTier } from "../../../../contexts/ClassificationContext";

export const dynamic = "force-dynamic";

interface GetBestClassificationProgressionDto {
  elements: SimplifiedHtsElement[];
  productDescription: string;
  htsDescription: string;
  classificationTier: ClassificationTier;
}

const BestProgression = z.object({
  index: z.number(),
  // description: z.string(),
  analysis: z.string(),
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
      classificationTier = "standard",
    }: GetBestClassificationProgressionDto = await req.json();

    if (!elements || !productDescription) {
      return NextResponse.json(
        {
          error: "Missing descriptions or product description",
        },
        { status: 400 }
      );
    }

    // TODO: Create the premium prompt
    // TODO: Create the premium prompt
    // TODO: Create the premium prompt
    // TODO: Create the premium prompt
    // Need to find a way to pass all the right data:
    // 1. Notes (deduplicated)
    // 2. GRI Rules
    // 3. Options that can be referenced and connected to notes
    // IMPORTANT: need to adjust the new qualify candidates route to only fetch section and chapter notes and
    // ignore all the others since they really don't matter at that leve... I think??? or it's actaully a
    // great thing to have them that early on 🤔

    const responseFormatOptions = {
      description:
        "Used to find the best next classification progression in the Harmonized Tariff System for a product description and the current classification description",
    };

    const responseFormat = zodResponseFormat(
      BestProgression,
      "best_classification_progression",
      responseFormatOptions
    );

    const gptResponse =
      classificationTier === "premium"
        ? await getBestClassificationProgressionPremium(
            responseFormat,
            productDescription,
            htsDescription,
            elements
          )
        : await getBestClassificationProgressionStandard(
            responseFormat,
            productDescription,
            htsDescription,
            elements
          );

    return NextResponse.json(gptResponse.choices);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
