import { NextResponse, NextRequest } from "next/server";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { requesterIsAuthenticated } from "../../supabase/server";
import { SimplifiedHtsElement } from "../../../../interfaces/hts";
import { OpenAIModel } from "../../../../libs/openai";
import { ClassificationTier } from "../../../../contexts/ClassificationContext";
import { APIPromise } from "openai/core";
import { AutoParseableResponseFormat } from "openai/lib/parser";
import { getSectionAndChapterFromHtsCode } from "../../../../libs/supabase/hts-notes";
import { NoteRecord } from "../../../../types/hts";

export const dynamic = "force-dynamic";

interface GetBestClassificationProgressionDto {
  elements: SimplifiedHtsElement[];
  productDescription: string;
  htsDescription: string;
  classificationTier: ClassificationTier;
  notes?: NoteRecord[]; // Pre-fetched notes from context (optional)
  level: number;
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
      notes: providedNotes,
      level,
    }: GetBestClassificationProgressionDto = await req.json();

    if (!elements || !productDescription || level == null) {
      return NextResponse.json(
        {
          error: "Missing candidates, product description, or level",
        },
        { status: 400 }
      );
    }

    const responseFormatOptions = {
      description:
        "Used to find the best next classification progression in the Harmonized Tariff System for a product description and the current classification description",
    };

    const responseFormat = zodResponseFormat(
      BestProgression,
      "best_classification_progression",
      responseFormatOptions
    );

    const griUsNotesPath = path.resolve(process.cwd(), "gri-and-us-notes.json");
    const griRules = JSON.parse(fs.readFileSync(griUsNotesPath, "utf-8"));

    const gptResponse =
      classificationTier === "premium"
        ? await getBestClassificationProgressionPremium(
            responseFormat,
            productDescription,
            htsDescription,
            elements,
            griRules,
            level,
            providedNotes
          )
        : await getBestClassificationProgressionStandard(
            responseFormat,
            productDescription,
            htsDescription,
            elements
          );

    console.log("Best Classification Progress Tokens:");
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

const getBestClassificationProgressionStandard = (
  responseFormat: AutoParseableResponseFormat<{
    index?: number;
    analysis?: string;
  }>,
  productDescription: string,
  htsDescription: string,
  candidateElements: SimplifiedHtsElement[]
): APIPromise<OpenAI.Chat.Completions.ChatCompletion> => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const labelledDescriptions = candidateElements.map(
    ({ description, code }, i) => `${i + 1}: ${code} - ${description}`
  );

  return openai.chat.completions.create({
    temperature: 0,
    model: OpenAIModel.FIVE_ONE,
    response_format: responseFormat,
    messages: [
      {
        role: "system",
        content: `Your job is to determine which description from the list would most accurately match the "Item Description" if it were added onto the end of the "Current Description".\n
          If the "Current Description" is not provided, determine which description best matches the "Item Description".\n
          If two or more options all sound like they could be a good fit, you should pick the one that is the most specific, for example if the "Item Description" is "jeans" and the options are "cotton fabric" and "trousers", you should pick "trousers" because it is more specific.\n
          You must pick a single description. If no option sounds suitable and "Other" is available as an option, you should pick it.\n
          Note: The use of semicolons (;) in the descriptions should be interpreted as "or" for example "mangoes;mangosteens" would be interpreted as "mangoes or mangosteens".\n
          In your response, "analysis" for your selection should explain why the description you picked is the most suitable match.\n
          You should refer to each option using its code and description (truncated if beyond 30 characters), not its index.
          The "index" of the best option must be included in your response\n"}`,
      },
      {
        role: "user",
        content: `Item Description: ${productDescription}\n
          ${htsDescription ? `Current Description: ${htsDescription}\n` : ""}
          Descriptions:\n ${labelledDescriptions.join("\n")}`,
      },
    ],
  });
};

const getBestClassificationProgressionPremium = async (
  responseFormat: AutoParseableResponseFormat<{
    index?: number;
    analysis?: string;
  }>,
  productDescription: string,
  htsDescription: string,
  candidateElements: SimplifiedHtsElement[],
  griRules: string,
  level: number,
  providedNotes?: NoteRecord[]
) => {
  if (!providedNotes) {
    throw new Error("No notes provided");
  }

  console.log("Provided Notes:");
  console.log(providedNotes);

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const candidates = candidateElements.map(
    (
      candidateElement,
      i
    ): {
      index: number;
      code: string;
      description: string;
      associatedNotes: string[];
    } => ({
      index: i + 1,
      ...candidateElement,
      associatedNotes: (() => {
        // After level 0, all notes will be the same for all candidates
        if (level > 0) {
          return providedNotes.map((note) => note.id);
        }

        // Get section and chapter numbers from the candidate element
        const sectionAndChapter = getSectionAndChapterFromHtsCode(
          candidateElement.code ?? ""
        );

        // If we couldn't determine section/chapter, return empty notes
        if (!sectionAndChapter) {
          return [];
        }

        const { section, chapter } = sectionAndChapter;

        // Compose IDs to match notesRegistry's id pattern
        const noteIds: string[] = [];

        providedNotes.map((note) => {
          if (note.type === "section" && note.number === section) {
            noteIds.push(note.id);
          }
          if (note.type === "chapter" && note.number === chapter) {
            noteIds.push(note.id);
          }
        });

        return noteIds;
      })(),
    })
  );

  console.log(`Candidates:`);
  console.log(candidates);

  return openai.chat.completions.create({
    temperature: 0,
    model: OpenAIModel.FIVE_ONE,
    response_format: responseFormat,
    messages: [
      {
        role: "system",
        content: `You are a United States Harmonized Tariff Schedule Expert.\n
        You must analyze the "Candidates" and select the one that best classifies the "Item Description", and best completes the "Current Description" (if provided).\n
        You must follow these rules to find the best candidate and shape your "analysis":\n
        1. Apply the "GRI Rules" sequentially (as needed) and consider all candidates in the list to shape your decision making logic. Start with GRI 1 and only proceed to subsequent rules if classification cannot be determined. The US Additional Rules supplement the GRI for US-specific classification requirements.\n
        2. For each candidate, you must use its "associatedNotes" (which are foreign keys to its associated "Legal Notes") to qualify each candidate and support your final decision.\n
        3. In your response, "analysis" should explain why the candidate you picked is the most suitable classification for the "Item Description" based on following the "GRI Rules" and the "Legal Notes". 
        It should be logically structued with good titles (not as a numbered list), should not be markdown, should not reference candidates by index, only by hts code or title, and should have good spacing.\n
        4. In your response, "index" must be the index of the best candidate\n
        
        Note: The use of semicolons (;) in the candidates should be interpreted as "or" for example "mangoes;mangosteens" would be interpreted as "mangoes or mangosteens".`,
      },
      {
        role: "user",
        content: `Item Description: ${productDescription}\n
          ${htsDescription ? `Current Description: ${htsDescription}\n` : ""}
          GRI Rules: ${JSON.stringify(griRules)}\n
          Legal Notes: ${JSON.stringify(providedNotes, null, 2)}\n
          Candidates:\n ${JSON.stringify(candidates, null, 2)}\n`,
      },
    ],
  });
};
