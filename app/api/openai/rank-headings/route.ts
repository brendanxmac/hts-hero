import { NextResponse, NextRequest } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { createClient, requesterIsAuthenticated } from "../../supabase/server";
import { SimplifiedHtsElement } from "../../../../interfaces/hts";

export const dynamic = "force-dynamic";

interface EvaluateHeadingsDto {
  headings: SimplifiedHtsElement[];
  productDescription: string;
}

const BestHeading = z.object({
  code: z.string(),
  evaluation: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const requesterIsAllowed = await requesterIsAuthenticated(req);

    // User who are not logged in can't access this request
    if (!requesterIsAllowed) {
      return NextResponse.json(
        { error: "You must be logged in to complete this action." },
        { status: 401 }
      );
    }

    const { headings, productDescription }: EvaluateHeadingsDto =
      await req.json();

    if (!headings || !productDescription) {
      return NextResponse.json(
        {
          error:
            "Missing headings to compare against or the product description",
        },
        { status: 400 }
      );
    }

    const headingCandidates = headings.map(
      ({ code, description }) => `${code}: ${description}`
    );

    console.log("Heading Candidates:", headingCandidates);

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const gptResponse = await openai.chat.completions.create({
      temperature: 0,
      model: "gpt-4o-2024-11-20",
      response_format: zodResponseFormat(BestHeading, "description_rankings", {
        description:
          "Used to analyze HTS headings against a product description and output a clear evaluation about which is the best and why, using the General Rules of Interpretation (GRI)",
      }),
      messages: [
        {
          role: "system",
          content: `You are a United States Harmonized Tariff System Expert who follows the General Rules of Interpretation (GRI) for the Harmonized System perfectly.\n
            Your job is to take a product description and a list of HTS Headings and output:
            1. A clear evaluation about which heading best classifies the product:\n
                a. You must use and sequentially reference the General Rules of Interpretation (GRI).\n
                b. You must consider all options in the list to shape your decision making logic.\n
                c. Your evaluation should follow the format (include single line breaks between the sections and their content, double line breaks between sections):\n
                Best Heading: [Code]:[Description]\n
                Justification: Explain why this heading best fits the product description under GRI 1.\n
                Comparison with Alternatives: Briefly explain why each rejected heading is less appropriate.\n
                Higher GRI Application (if needed): If multiple headings could apply, explain why the chosen heading prevails using GRI 3(a), 3(b), or 3(c). If the product is unfinished or mixed, apply GRI 2(a) or 2(b) as needed.\n
                Final Conclusion: A concise summary of why the selected heading is the best classification.
            2. The code of the best match\n`,
        },
        {
          role: "user",
          content: `Product Description: ${productDescription}\n
         HTS Headings: ${headingCandidates.join("\n")}`,
        },
      ],
    });

    return NextResponse.json(gptResponse.choices);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
