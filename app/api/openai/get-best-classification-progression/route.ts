import { NextResponse, NextRequest } from "next/server";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { requesterIsAuthenticated } from "../../supabase/server";
import {
  LevelSelection,
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
  selectionPath: LevelSelection[];
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
      selectionPath,
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
        "Used to find the best candidate in a given level of the Harmonized Tariff System",
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
            selectionPath,
            elements,
            level,
            providedNotes
          )
        : await getBestClassificationProgressionStandard(
            responseFormat,
            productDescription,
            selectionPath,
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
  selectionPath: LevelSelection[],
  candidateElements: SimplifiedHtsElement[]
): Promise<OpenAI.Chat.Completions.ChatCompletion> => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const labeledCandidates: SimplifiedHtsElementWithIdentifier[] =
    candidateElements.map((c, i) => ({
      ...c,
      identifier: indexToIdentifier(i),
    }));

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
          In "analysis" you should refer to each option by its code or description (truncated if beyond 30 characters), never by its identifier letter.
          The "identifier" property of your response must be the exact letter identifier (e.g., "A", "B", "C") of your chosen candidate.\n`,
      },
      {
        role: "user",
        content: `Item Description: ${productDescription}
          ${selectionPath && selectionPath.length > 0 ? `Selection Path:\n${JSON.stringify(selectionPath, null, 2)}\n` : ""}
          Candidates:\n ${JSON.stringify(labeledCandidates, null, 2)}`,
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
  selectionPath: LevelSelection[],
  candidateElements: SimplifiedHtsElement[],
  level: number,
  providedNotes?: NoteRecord[]
): Promise<OpenAI.Chat.Completions.ChatCompletion> => {
  const griRulesPath = path.resolve(
    process.cwd(),
    "rules-for-classification.json"
  );

  const griRules = JSON.parse(fs.readFileSync(griRulesPath, "utf-8"));

  if (!providedNotes) {
    throw new Error("No notes provided");
  }

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

  return openai.chat.completions.create({
    temperature: 0,
    model: OpenAIModel.FIVE_ONE,
    response_format: responseFormat,
    messages: [
      {
        role: "system",
        content: `You are a United States Harmonized Tariff Schedule Expert.
        Your job is to select which candidate best matches the Item Description when appended to the end of the Selection Path.
        You will be provided with the Item Description, a list of Candidates, a set of Legal Notes, and the current Selection Path to do this.
        The Selection Path contains the HTS parent elements selected prior to this level. If not provided, this is the first level (heading level).
        All candidates are valid candidates for the given level, NEVER disregard a candidate just because it doesn't a "code".
        
        You MUST follow these exact steps to find best candidate:
        1. Analyze each candidate one by one to determine how well it matches the Item Description when appended to the end of the Selection Path.
           (a) You must use a candidates associatedNotes (which are references to its associated Legal Notes) to qualify its fit with the item description.
           (b) If provided, use a candidates referencedCodes (which are HTS codes referenced in that candidate's description) to help understand what the candidate is referring to.
           (c) The use of semicolons (;) in candidates descriptions should be interpreted as "or". For example "mangoes;mangosteens" would be interpreted as "mangoes or mangosteens".,
        2. Apply the following GRI Rules sequentailly while considering all candidates to shape your decision. Only proceed to and apply the sequential rules if a winning candidate is not clearly determined based on the current one.
        GRI Rules:\n${JSON.stringify(griRules, null, 2)}


        In your response, "analysis" should:
        * Provide a concise summary of why the candidate you picked is the most suitable match for the "Item Description" based on the "GRI Rules" and referncing the relevant "Legal Notes".
        * Have 1 section called "Analysis", which is a summary of why the candidate you picked is the most suitable match for the "Item Description" based on the "GRI Rules", the relevant "Legal Notes", and the "Selection Path" (if provided). If no Selection Path is provided, you should not mention it.
        * Be logically structured with good titles (not as a numbered list), not be markdown, only reference candidates by code or description (not by their letter identifier), and should have good spacing.

        The "identifier" property of your response must be the exact letter identifier (e.g., "A", "B", "C") of your chosen candidate.`,
      },
      {
        role: "user",
        content: `Item Description: ${productDescription}\n
          ${selectionPath && selectionPath.length > 0 ? `Selection Path:\n${JSON.stringify(selectionPath, null, 2)}\n` : ""}
          Legal Notes:\n ${JSON.stringify(providedNotes, null, 2)}\n
          Candidates:\n ${JSON.stringify(candidates, null, 2)}\n`,
      },
    ],
  });
};
