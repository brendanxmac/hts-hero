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
  analysis: z.string(),
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

    const responseFormatOptions = {
      description:
        "Used to determine if a section or chapter is qualified or unqualified as a potential classifier of the item description based on the notes for the candidate",
    };
    const responseFormat = zodResponseFormat(
      CandidateQualification,
      "candidate_qualification",
      responseFormatOptions
    );

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

    const candidateTypeTitle =
      candidateType === "section" ? "Section" : "Chapter";

    const notesMarkdown = notes
      .map((note) => renderNoteContext(buildNoteTree(note)))
      .join("\n");

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const gptResponse = await openai.chat.completions.create({
      temperature: 0,
      model: OpenAIModel.FIVE_ONE,
      response_format: responseFormat,
      messages: [
        {
          role: "system",
          content: `You are a United States Harmonized Tariff Schedule Expert.\n
          Your job is to qualify each ${candidateType} candidate based on how well it fits the Item Description and how likely it is to contain children elements within it that properly classify the Item Description.\n
          You must use the Notes provided to qualify each candidate.\n
          If there are no notes for a candidate, you should mention that and provide reasoning as to why it's a good or bad candidate.
          
          In your response, "analysis" should include a "Qualification" and "Reasoning from Notes" section for each candidate.\n
          Each candidate should be clearly labeled with "Candiate <index>: <newline>${candidateTypeTitle} <candidate number (as number, not roman numeral)> - <candidate description>".\n
          The "Qualification" should be a single sentance that briefly outlines candidate strength, and be formatted as: "Qualification:<newline><qualification>".\n
          "Reasoning from Notes" should be a very concise summary of which notes, if any, qualify or disqualify the candidate, and be formatted as: "Reasoning from Notes:<newline><reasoning from notes as bullet points>".\n
          Only mention notes that have an impact on classification for the provided item description.\n
          Your "analysis" response should have generous spacing so it is easy to read.\n
          
          If there is enough evidence to disqualify a candidate based on the notes, its index should be included in the the "unqualifiedCandidates" property of your response.`,
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
