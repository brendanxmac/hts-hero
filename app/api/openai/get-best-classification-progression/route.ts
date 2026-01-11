import { NextResponse, NextRequest } from "next/server";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { requesterIsAuthenticated } from "../../supabase/server";
import {
  SimplifiedHtsElement,
  SimplifiedHtsElementWithIdentifier,
} from "../../../../interfaces/hts";
import { OpenAIModel } from "../../../../libs/openai";
import { ClassificationTier } from "../../../../contexts/ClassificationContext";
import { AutoParseableResponseFormat } from "openai/lib/parser";
import { getSectionAndChapterFromHtsCode } from "../../../../libs/supabase/hts-notes";
import { NoteRecord } from "../../../../types/hts";

export const dynamic = "force-dynamic";

/**
 * Converts a 0-based index to a letter identifier (A, B, C... Z, AA, AB, etc.)
 * Supports unlimited options using Excel-style column naming.
 */
const indexToIdentifier = (index: number): string => {
  let result = "";
  let num = index;

  do {
    result = String.fromCharCode(65 + (num % 26)) + result;
    num = Math.floor(num / 26) - 1;
  } while (num >= 0);

  return result;
};

/**
 * Converts a letter identifier (A, B, C... Z, AA, AB, etc.) back to a 0-based index.
 */
const identifierToIndex = (identifier: string): number => {
  let result = 0;
  for (let i = 0; i < identifier.length; i++) {
    result = result * 26 + (identifier.charCodeAt(i) - 64);
  }
  return result - 1;
};

interface GetBestClassificationProgressionDto {
  elements: SimplifiedHtsElement[]; // Elements may include referencedCodes
  productDescription: string;
  htsDescription: string;
  classificationTier: ClassificationTier;
  notes?: NoteRecord[]; // Pre-fetched notes from context (optional)
  level: number;
}

const BestProgression = z.object({
  identifier: z.string(), // Letter identifier (A, B, C, etc.) of the selected candidate
  analysis: z.string(),
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

    const griRulesPath = path.resolve(
      process.cwd(),
      "rules-for-classification.json"
    );
    const griRules = JSON.parse(fs.readFileSync(griRulesPath, "utf-8"));

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

    // Transform the response to include the derived index from the identifier
    const transformedChoices = gptResponse.choices.map((choice) => {
      if (choice.message?.content) {
        try {
          const parsed = JSON.parse(choice.message.content);
          const identifier = parsed.identifier as string;
          const index = identifierToIndex(identifier);

          console.log(`Identifier "${identifier}" resolved to index ${index}`);

          return {
            ...choice,
            message: {
              ...choice.message,
              content: JSON.stringify({
                ...parsed,
                index, // Add the derived index for backward compatibility
              }),
            },
          };
        } catch {
          return choice;
        }
      }
      return choice;
    });

    return NextResponse.json(transformedChoices);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

const getBestClassificationProgressionStandard = (
  responseFormat: AutoParseableResponseFormat<{
    identifier?: string;
    analysis?: string;
  }>,
  productDescription: string,
  htsDescription: string,
  candidateElements: SimplifiedHtsElement[]
): Promise<OpenAI.Chat.Completions.ChatCompletion> => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const labeledCandidates: SimplifiedHtsElementWithIdentifier[] =
    candidateElements.map((c, i) => ({
      ...c,
      identifier: indexToIdentifier(i),
    }));

  console.log("🔵🔵 CANDIDATES");
  console.log(labeledCandidates);

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
          Some candidates include "referencedCodes" which are HTS codes referenced in that candidates description. Use these to help understand what the candidate is referring to.\n
          Note: The use of semicolons (;) in the descriptions should be interpreted as "or" for example "mangoes;mangosteens" would be interpreted as "mangoes or mangosteens".\n
          In your response, "analysis" for your selection should explain why the description you picked is the most suitable match.\n
          In "analysis" you should refer to each option using its code and description (truncated if beyond 30 characters), never its identifier letter.
          The "identifier" property of your response must be the exact letter identifier (e.g., "A", "B", "C") of your chosen candidate.\n`,
      },
      {
        role: "user",
        content: `Item Description: ${productDescription}\n
          ${htsDescription ? `Current Description: ${htsDescription}\n` : ""}
          Candidates:\n ${JSON.stringify(labeledCandidates, null, 2)}\n`,
      },
    ],
  });
};

const getBestClassificationProgressionPremium = async (
  responseFormat: AutoParseableResponseFormat<{
    identifier?: string;
    analysis?: string;
  }>,
  productDescription: string,
  htsDescription: string,
  candidateElements: SimplifiedHtsElement[],
  griRules: string,
  level: number,
  providedNotes?: NoteRecord[]
): Promise<OpenAI.Chat.Completions.ChatCompletion> => {
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
      identifier: string;
      code: string;
      description: string;
      associatedNotes: string[];
      referencedCodes?: Record<string, string>;
    } => ({
      identifier: indexToIdentifier(i),
      code: candidateElement.code,
      description: candidateElement.description,
      referencedCodes: candidateElement.referencedCodes,
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

  console.log("🌱🌱 CANDIDATES");
  console.log(candidates);

  console.log("GRI RULES:");
  console.log(griRules);

  return openai.chat.completions.create({
    temperature: 0,
    model: OpenAIModel.FIVE_ONE,
    response_format: responseFormat,
    messages: [
      {
        role: "system",
        content: `You are a United States Harmonized Tariff Schedule Expert.\n
        Analyze all the Candidates and select the one whose description best matches the Item Description, and best completes the Current Description (if provided).\n
        You must follow these rules to find the best candidate:\n 
        1. Apply the Classification Rules below and consider all candidates to shape your decision. Start with GRI 3(a) and only proceed to the next rule if a candidate cannot be clearly determined.\n
        2. For each candidate, you must use its associatedNotes (which are references to its associated Legal Notes) to qualify it and support your final decision.\n
        3. Some candidates include "referencedCodes" which are HTS codes referenced in that candidate's description. Use these to help understand what the candidate is referring to.\n
        4. In your response, "analysis" should explain why the candidate you picked is the most suitable description of the "Item Description" based on following the "GRI Rules" and referncing the "Legal Notes".\n
        "analysis" should be logically structured with good titles (not as a numbered list), should not be markdown, should only reference candidates by code or description (not by their letter identifier), and should have good spacing.\n
        5. The "identifier" property of your response must be the exact letter identifier (e.g., "A", "B", "C") of your chosen candidate.\n

        Classification Rules:\n ${JSON.stringify(griRules, null, 2)}\n
        
        Note: The use of semicolons (;) in the candidates should be interpreted as "or" for example "mangoes;mangosteens" would be interpreted as "mangoes or mangosteens".`,
      },
      {
        role: "user",
        content: `Item Description: ${productDescription}\n
          ${htsDescription ? `Current Description: ${htsDescription}\n` : ""}
          Legal Notes:\n ${JSON.stringify(providedNotes, null, 2)}\n
          Candidates:\n ${JSON.stringify(candidates, null, 2)}\n`,
      },
    ],
  });
};
