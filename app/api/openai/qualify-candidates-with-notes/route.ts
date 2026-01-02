import { NextResponse, NextRequest } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { createClient, requesterIsAuthenticated } from "../../supabase/server";
import { OpenAIModel } from "../../../../libs/openai";
import { fetchHtsNotesFromSupabase } from "../../../../libs/supabase/hts-notes";
import { buildNoteTree, renderNoteContext } from "../../../../libs/hts";
import { QualifyCandidatesWithNotesDto } from "../../../../interfaces/hts";

export const dynamic = "force-dynamic";

const CandidateQualification = z.object({
  qualification: z.string(),
  unqualifiedCandidates: z.array(z.number()),
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
      productDescription,
      candidates,
      candidateType,
    }: QualifyCandidatesWithNotesDto = await req.json();

    console.log("productDescription:");
    console.log(productDescription);
    console.log("candidates:");
    console.log(candidates);
    console.log("candidateType:");
    console.log(candidateType);

    if (
      !candidates ||
      candidates.length === 0 ||
      !productDescription ||
      !candidateType
    ) {
      return NextResponse.json(
        {
          error: "Missing candidates or product description or candidate type",
        },
        { status: 400 }
      );
    }

    const labelledDescriptions = candidates.map(
      ({ description, identifier }, i) =>
        `${i + 1}. ${candidateType === "section" ? "Section" : "Chapter"} ${identifier}: ${description}`
    );

    console.log("labelledDescriptions:");
    console.log(labelledDescriptions);

    const responseFormatOptions = {
      description:
        "Used to determine if a section or chapter is qualified or unqualified as a potential classifier based on the product description and the notes for the candidate",
    };
    const responseFormat = zodResponseFormat(
      CandidateQualification,
      "candidate_qualification",
      responseFormatOptions
    );

    console.log("Fetching notes for candidates");

    const supabase = createClient();
    const notes = await Promise.all(
      candidates.map((candidate) =>
        fetchHtsNotesFromSupabase(
          supabase,
          candidateType === "section" ? candidate.identifier : null,
          candidateType === "chapter" ? candidate.identifier : null,
          candidateType === "section" ? true : false
        )
      )
    );

    const notesMarkdown = notes
      .map((note) => renderNoteContext(buildNoteTree(note)))
      .join("\n");

    console.log("Notes for Candidates:", notesMarkdown);

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const gptResponse = await openai.chat.completions.create({
      temperature: 0,
      model: OpenAIModel.FIVE_ONE,
      response_format: responseFormat,
      messages: [
        {
          role: "system",
          content: `You are a United States Harmonized Tariff Schedule Expert.\n
          Your job is to qualify each ${candidateType} based on how well it fits the Item Description and is likely to have elements within it that are a good classification of the Item Description.\n
          You must use the notes to qualify each ${candidateType}.\n
          If there are no notes for a ${candidateType}, you should mention that and provide reasoning as to why it's a good or bad candidate.
          
          Note: The use of semicolons (;) in the descriptions should be interpreted as "or" for example "mangoes;mangosteens" would be interpreted as "mangoes or mangosteens".\n
          In your response, "qualification" should include your qualification of each ${candidateType}.\n
          If a certain candidate is disqualified based on the notes, you should include the reason in the "qualification" and the "unqualifiedCandidates" array should include the index of the candidate that is disqualified.`,
        },
        {
          role: "user",
          content: `Item Description: ${productDescription}\n
          Candidates:\n ${labelledDescriptions.join("\n")}\n
          Notes:\n ${notesMarkdown}`,
        },
      ],
    });

    return NextResponse.json(gptResponse.choices);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
