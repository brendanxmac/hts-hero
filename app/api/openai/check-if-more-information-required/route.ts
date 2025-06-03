import { NextResponse, NextRequest } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { requesterIsAuthenticated } from "../../supabase/server";
import { SimplifiedHtsElement } from "../../../../interfaces/hts";
import { ChatMessage } from "../../../../types/chat";

export const dynamic = "force-dynamic";

interface GetBestClassificationProgressionDto {
  elements: SimplifiedHtsElement[];
  productDescription: string;
  htsDescription: string;
  chatHistory?: ChatMessage[];
}

const MisingInformation = z.object({
  followUpQuestion: z.string().nullable(),
  reason: z.string().nullable(),
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
    }: GetBestClassificationProgressionDto = await req.json();

    if (!elements || !productDescription) {
      return NextResponse.json(
        {
          error: "Missing descriptions or product description",
        },
        { status: 400 }
      );
    }

    const labelledDescriptions = elements.map(
      ({ description }, i) => `${i}: ${description}`
    );

    const responseFormatOptions = {
      description:
        "Used to find the best next classification progression in the Harmonized Tariff System for a product description and the current classification description",
    };
    const responseFormat = zodResponseFormat(
      MisingInformation,
      "missing_information",
      responseFormatOptions
    );

    console.log(
      `Product Description: ${productDescription}\n
          ${
            htsDescription &&
            `Current Classification Description: ${htsDescription}\n`
          }
        Candidate Elements:\n ${labelledDescriptions.join("\n")}`
    );

    const fewShotExamples = [
      {
        role: "user",
        content: `Product Description: Men’s 100% cotton denim jeans, pre-washed\n
            Candidate Elements:
            0: Woven fabrics of cotton, containing 85 percent or more by weight of cotton, weighing not more than 200 g/m²:,
            1: Woven fabrics of cotton, containing 85 percent or more by weight of cotton, weighing more than 200 g/m²:,
            2: Men's or boys' suits, ensembles, suit-type jackets, blazers, trousers, bib and brace overalls, breeches and shorts (other than swimwear):`,
      },
      {
        role: "assistant",
        content: `{
                "followUpQuestion": null,
            }`,
      },
      {
        role: "user",
        content: `Product Description: Fresh Mangoes\n
            Candidate Elements:
            0: Certified Organic,
            1: Other:`,
      },
      {
        role: "assistant",
        content: `{
                "followUpQuestion": Are the mangoes certified organic?,
            }`,
      },
    ];

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const gptResponse = await openai.chat.completions.create({
      temperature: 0.2,
      model: "gpt-4o-2024-11-20",
      response_format: responseFormat,
      //   TODO: consider whether or not to generalize this to just ask for the next best string match... and not using so much classification language
      messages: [
        {
          role: "system",
          //   You are an expert in the U.S. Harmonized Tariff Schedule (HTS), following the General Rules of Interpretation (GRI).
          content: `You are an HTS classification expert.
          You will be given a product description & a list of description candidates that could be used to classify the product.
          Your job is to determine ONLY whether a **follow-up question** is needed to help choose among the candidates, and why.
          The question should be formatted as a clear and useful yes or no question.
          You should err on the side of not asking a question, unless there is absolutely no way to choose a candidate that matches the product description without getting more information (not just "nice to have" information).
          `.trim(),
        },
        {
          role: "user",
          content: `Product Description: ${productDescription.trim().replace(/\s+/g, " ")}\n
              Candidate Elements:\n ${labelledDescriptions.join("\n")}`,
        },
      ],
    });

    return NextResponse.json(gptResponse.choices);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
