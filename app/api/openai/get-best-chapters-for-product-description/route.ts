import { NextResponse, NextRequest } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { requesterIsAuthenticated } from "../../supabase/server";
import path from "path";
import { readFile } from "fs/promises";
import { HtsSection } from "../../../../interfaces/hts";
import { getMinMaxRangeText } from "../../../../utilities/data";

export const dynamic = "force-dynamic";

interface GetBestChaptersForProductDescriptionDto {
  productDescription: string;
}

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

    const { productDescription }: GetBestChaptersForProductDescriptionDto =
      await req.json();

    if (!productDescription) {
      return NextResponse.json(
        {
          error: "Missing classification descriptions or product description",
        },
        { status: 400 }
      );
    }

    const filePath = path.join(process.cwd(), "sections-and-chapters.json");
    const sectionData = await readFile(filePath, "utf8");
    const sectionsAndChapters: { sections: HtsSection[] } =
      JSON.parse(sectionData);
    const chapters = sectionsAndChapters.sections
      .map((section) => section.chapters)
      .flat();

    const chapterTitles = chapters.map(
      (chapter) => `${chapter.number}. ${chapter.description}`
    );

    const ResponseSchema = z.object({
      chapters: z.array(z.number()),
    });
    const responseFormatOptions = {
      description:
        "Used to get the best chapter matches against a product description from an array",
    };
    const responseFormat = zodResponseFormat(
      ResponseSchema,
      "best_chapters",
      responseFormatOptions
    );

    const minMaxRangeText = getMinMaxRangeText(3, 6);

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const gptResponse = await openai.chat.completions.create({
      temperature: 0,
      // model: "o1-2024-12-17",
      // model: "o3-mini-2025-01-31",
      //   model: "gpt-4o-mini-2024-07-18",
      model: "gpt-4o-2024-11-20",
      response_format: responseFormat,
      messages: [
        {
          role: "system",
          content: `You are a United States Harmonized Tariff System Expert who follows the General Rules of Interpretation (GRI) for the Harmonized System perfectly.\n
            Your job is to take a product description and a list of classification descriptions, and figure out which description(s) from the list most closely fit the product description (${minMaxRangeText}).\n
            Your response should be an array containing the numbers of the best fitting candidates from the list ordered from best match to worst.
            `,
        },
        {
          role: "user",
          content: `Product Description: ${productDescription}\n
         Classification Descriptions: ${chapterTitles.join("\n")}`,
        },
      ],
    });

    return NextResponse.json(gptResponse.choices);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
