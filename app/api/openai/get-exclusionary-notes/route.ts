import { NextResponse, NextRequest } from "next/server";
import OpenAI from "openai";
import { OpenAIModel } from "../../../../libs/openai";
import { createClient } from "../../../../libs/supabase/server";
import { Note } from "../../../../interfaces/hts";

export const dynamic = "force-dynamic";

interface GetExclusionaryNotesDto {
  productDescription: string;
  notes: Note[];
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    // User who are not logged in can't make a gpt requests
    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to complete this action." },
        { status: 401 }
      );
    }

    const { notes, productDescription }: GetExclusionaryNotesDto =
      await req.json();

    if (!notes || !productDescription) {
      return NextResponse.json(
        {
          error:
            "Missing descriptions to compare against or the product description",
        },
        { status: 400 }
      );
    }

    const noteStrings = notes.map((n, i) => `${i}. ${n.content}`).join("\n");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const gptResponse = await openai.chat.completions.create({
      temperature: 0.3,
      model: OpenAIModel.FOUR_LATEST,
      messages: [
        {
          role: "system",
          content: `You are a Harmonized Tariff System expert.\n
        You will be given a product description and notes from the "notes" subsection of Section XV which contains Chapters 72-83\n
        Your task is to determine if any of these notes sound like they would prevent the product from being classified in this section at large.\n
        Importantly, do not include notes that would only prevent the product from being classified in some of the chapters within this section (72-83).\n
        Most of the notes you will see are only the heading for a list, for example "This section does not cover:" might be the text you are provided, and what you won't be provided is the whole list that follows.\n
        
        Your response should:\n
        1. Be ONLY a JSON array of objects, which might prevent the product from being classified within this section.\n
          a. Each object in the array should have the following structure:\n
              index: number; // index of the note in the original list\n
              content: string; // original content of the note with nothing removed or changed\n
              reasoning: string; // reasoning for why the note or potentially its unprovided list might prevent the product being classified in this section\n
        2. Not contain the code block formatting indicating it is json`,
        },
        {
          role: "user",
          content: `Product Description:\n ${productDescription}\n\n Notes:\n${noteStrings}`,
        },
      ],
    });

    return NextResponse.json(gptResponse.choices);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
