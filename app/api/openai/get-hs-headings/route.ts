import { NextResponse, NextRequest } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { OpenAIModel } from "../../../../libs/openai";
import { createClient } from "../../../../libs/supabase/server";

export const dynamic = "force-dynamic";

interface GetHtsHeadingsDto {
  productDescription: string;
  model?: OpenAIModel;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    // User who are not logged in can't make a gpt requests
    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to complete this action" },
        { status: 401 }
      );
    }

    const { productDescription, model }: GetHtsHeadingsDto = await req.json();

    if (!productDescription) {
      return NextResponse.json(
        { error: "Missing product description" },
        { status: 400 }
      );
    }

    const candidateHeader = z.object({
      section: z.string(),
      description: z.string(),
      logic: z.string(),
    });

    const candidates = z.object({
      candidates: z.array(candidateHeader),
    });

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    // const gptResponse = await openai.chat.completions.create({
    //   temperature: 0.7,
    //   top_p: 1.0,
    //   model: model || OpenAIModel.FOUR_MINI,
    //   messages: [
    //     {
    //       role: "system",
    //       content:
    //         "You are ChatGPT, a large language model trained by OpenAI. Answer as helpfully and accurately as possible.",
    //     },
    //     {
    //       role: "user",
    //       content: `Use the General Rules for the Interpretation of the Harmonized System to determine which headings (at least 2) most accurately describe: ${productDescription}.
    //     Your response should be:
    //     1. ONLY a stringified array of objects sorted by best match to worst match where each object matches the following structure: { heading: string,  desciption: string, logic: string}.
    //     2. Without the code block formatting indicating it is json`,
    //     },
    //   ],
    // });
    const gptResponse = await openai.chat.completions.create({
      temperature: 0.3,
      model: "gpt-4o-2024-11-20",
      response_format: zodResponseFormat(candidates, "section", {
        description:
          "Used to ensure the ordered array from best candidate match to worst match can be parsed",
      }),
      messages: [
        {
          role: "system",
          content: `You are a United States Harmonized Tariff System Expert who follows the General Rules for the Interpretation (GRI) of the Harmonized System perfectly.
            Your job is to classify product descriptions into HS sections as accurately as possible using the GRI.
            Each section selection must refer to the GRI rules & explain why it's a good match, with the best match as the first in the response`,
        },
        {
          role: "user",
          content: productDescription,
        },
      ],
    });
    // const gptResponse = await openai.chat.completions.create({
    //   temperature: 0.3,
    //   model: "gpt-4o-2024-11-20",
    //   // response_format: zodResponseFormat(candidates, "headings", {
    //   //   description:
    //   //     "Used to ensure the ordered array by best candidate match to poorest match can be parsed",
    //   // }),
    //   messages: [
    //     {
    //       role: "system",
    //       content: `You are a United States Harmonized Tariff System (HTS) Expert who follows the General Rules for the Interpretation (GRI) of the Harmonized System perfectly.
    //         Your job is to determine whether or not a product description is detailed enough to be able to be succesfully classified in the United States HTS.
    //         Whether it is or is not, provide only a brief summary of what could be done to improve its ability to be classified successfully in the HTS`,
    //     },
    //     {
    //       role: "user",
    //       content: productDescription,
    //     },
    //   ],
    // });

    return NextResponse.json(gptResponse.choices);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

// 1. ONLY a stringified array of objects where each object matches the following structure: { heading: "xxxx",  desciption: 'lorem ipsum...', logic: 'the reason why this heading makes sense...'}.
