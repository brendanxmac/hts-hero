import { NextResponse, NextRequest } from "next/server";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { createClient, requesterIsAuthenticated } from "../../supabase/server";
import { SimplifiedHtsElement } from "../../../../interfaces/hts";
import { OpenAIModel } from "../../../../libs/openai";
import { ClassificationTier } from "../../../../contexts/ClassificationContext";
import { APIPromise } from "openai/core";
import { AutoParseableResponseFormat } from "openai/lib/parser";
import { renderNoteContext, buildNoteTree } from "../../../../libs/hts";
import {
  getSectionAndChapterFromHtsCode,
  fetchHtsNotesForSectionsAndChapters,
} from "../../../../libs/supabase/hts-notes";
import { NoteRecord } from "../../../../types/hts";

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

    const griUsNotesPath = path.resolve(process.cwd(), "gri-and-us-notes.json");
    const griRules = JSON.parse(fs.readFileSync(griUsNotesPath, "utf-8"));

    const gptResponse =
      classificationTier === "premium"
        ? await getBestClassificationProgressionPremium(
            responseFormat,
            productDescription,
            htsDescription,
            elements,
            griRules
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
    ({ description }, i) => `${i + 1}: ${description}`
  );

  return openai.chat.completions.create({
    temperature: 0,
    model: OpenAIModel.FIVE_ONE,
    response_format: responseFormat,
    messages: [
      {
        role: "system",
        content: `Your job is to determine which description from the list would most accurately match the item description if it were added onto the end of the current description.\n
          If the current description is not provided just determine which description best matches the item description itself.\n
          If two or more options all sound like they could be a good fit, you should pick the one that is the most specific, for example if the item description is "jeans" and the options are "cotton fabric" and "trousers", you should pick "trousers" because it is more specific.\n
          You must pick a single description. If no option sounds suitable and "Other" is available as an option, you should pick it.\n
          Note: The use of semicolons (;) in the descriptions should be interpreted as "or" for example "mangoes;mangosteens" would be interpreted as "mangoes or mangosteens".\n
          In your response, "analysis" for your selection should explain why the description you picked is the most suitable match.\n
          You should refer to the selected option as "this option" instead of writing out the option description, truncate the descriptions of the others options if beyond 30 characters if mentioned, and the item description itself should be always be referred to as "item description".\n
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
  griRules: string
) => {
  // Create a function that will get notes for candidates
  // First, try to check if the notes exist in context
  // If not, then go fetch the notes from database & do processing

  // If we are beyond progressionLevel 1
  // Check if there is a selectedElement for first progressionLevel
  // If yes, use it to grab the section and chapter, and we won't
  // have to grab notes for everything thereafter

  // Actually... use context to store fetched notes, stored as NoteRecord
  // If we are beyond the first level, just fetch the notes for the section and chapter
  // of the selectedElement, and then do the associations of the candidates to those
  // notes here below.

  // although, consider the case where there's WAY too many notes, like Ch 84 (i think)

  // Collect unique sections and chapters from candidates
  const sections = new Set<number>();
  const chapters = new Set<number>();

  for (const candidate of candidateElements) {
    const result = getSectionAndChapterFromHtsCode(candidate.code);
    if (result) {
      sections.add(result.section);
      chapters.add(result.chapter);
    }
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const supabase = createClient();

  // Fetch all notes in a single query, grouped by section and chapter
  const groupedNotes = await fetchHtsNotesForSectionsAndChapters(
    supabase,
    Array.from(sections),
    Array.from(chapters)
  );

  console.log("groupedNotes:");
  console.log(groupedNotes);

  // Build notes registry by rendering each section and chapter's notes
  const notes: NoteRecord[] = [
    ...Array.from(groupedNotes.sections.entries()).map(
      ([sectionNum, notes]) => ({
        id: `Section-${sectionNum}`,
        type: "section",
        number: sectionNum,
        text: renderNoteContext(buildNoteTree(notes)),
      })
    ),
    ...Array.from(groupedNotes.chapters.entries()).map(
      ([chapterNum, notes]) => ({
        id: `Chapter-${chapterNum}`,
        type: "chapter",
        number: chapterNum,
        text: renderNoteContext(buildNoteTree(notes)),
      })
    ),
  ];

  console.log(
    `Fetched notes for ${groupedNotes.sections.size} sections and ${groupedNotes.chapters.size} chapters`
  );

  console.log(`Notes Registry:`);
  console.log(notes);

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
        // Get section and chapter numbers from the candidate element
        const { section, chapter } = getSectionAndChapterFromHtsCode(
          candidateElement.code ?? ""
        );
        // Compose IDs to match notesRegistry's id pattern
        const noteIds: string[] = [];

        notes.map((note) => {
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
          Legal Notes: ${JSON.stringify(notes, null, 2)}\n
          Candidates:\n ${JSON.stringify(candidates, null, 2)}\n`,
      },
    ],
  });
};
