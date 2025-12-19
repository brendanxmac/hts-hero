import { NextResponse, NextRequest } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { requesterIsAuthenticated } from "../../supabase/server";
import { SimplifiedHtsElement } from "../../../../interfaces/hts";
import { OpenAIModel } from "../../../../libs/openai";

export const dynamic = "force-dynamic";

interface GetBestClassificationProgressionDto {
  elements: SimplifiedHtsElement[];
  productDescription: string;
  htsDescription: string;
}

const TestBestProgression = z.object({
  index: z.number(),
});

const BestProgression = z.object({
  index: z.number(),
  description: z.string(),
  logic: z.string(),
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
      ({ description }, i) => `${i + 1}: ${description}`
    );

    const isTestEnv = process.env.APP_ENV === "test";
    const responseFormatOptions = {
      description:
        "Used to find the best next classification progression in the Harmonized Tariff System for a product description and the current classification description",
    };
    const responseFormat = isTestEnv
      ? zodResponseFormat(
          TestBestProgression,
          "test_best_progression",
          responseFormatOptions
        )
      : zodResponseFormat(
          BestProgression,
          "best_classification_progression",
          responseFormatOptions
        );

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const gptResponse = await openai.chat.completions.create({
      temperature: 0,
      model: OpenAIModel.FIVE_ONE,
      response_format: responseFormat,
      // In your response, "questions" is optional, and should only have questions about the product that would help make a better decision between the options, if answered.\n
      messages: [
        {
          role: "system",
          content: `Your job is to determine which description from the list most accurately describes the item description under the United States Harmonized Tariff System (HTS).
If a current description is provided, determine which option most appropriately narrows or completes that description in a meaningful way.
If no current description is provided, determine which option best describes the item description on its own.

You must compare the options against each other, not independently.
If multiple options could apply, select the most specific option that most fully contains the item description within its scope.

Do not select an option if the item description would fall outside the scope of that option, even if there is partial or superficial similarity.

Select "Other" only if none of the more specific options accurately describe the item.

Note: Semicolons (;) in descriptions mean "or" (e.g., "mangoes;mangosteens" = "mangoes or mangosteens").

You must select exactly one option.
In your response:
- Refer to the selected option as "this option"
- Refer to the item description as "item description"
- If mentioning other options, only mentions their description, not option number & truncate their descriptions beyond 30 characters
- Explain why this option is correct and why the alternatives are less appropriate very briefly

${isTestEnv ? "The index of the selected option must be included in your response." : ""}
`,
        },
        {
          role: "user",
          content: `Item Description: ${productDescription}\n
          ${htsDescription ? `Current Description: ${htsDescription}\n` : ""}

The following descriptions are mutually exclusive candidate refinements.
Some descriptions may define scope indirectly by referencing other headings or categories.

Descriptions:\n ${labelledDescriptions.join("\n")}`,
        },
      ],
    });

    return NextResponse.json(gptResponse.choices);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

// content: `Your job is to determine which description from the list would most accurately match the item description if it were added onto the end of the current description.\n
// If the current description is not provided just determine which description best matches the item description itself.\n
// If two or more options all sound like they could be a good fit, you should pick the one that is the most specific, for example if the item description is "jeans" and the options are "cotton fabric" and "trousers", you should pick "trousers" because it is more specific.\n
// You must pick a single description. If option sounds suitable and "Other" is available as an option, you should pick it.\n
// Note: The use of semicolons (;) in the descriptions should be interpreted as "or" for example "mangoes;mangosteens" would be interpreted as "mangoes or mangosteens".\n
// In your response, "logic" for your selection should explain why the description you picked is the most suitable match.\n
// You should refer to the selected option as "this option" instead of writing out the option description, truncate the descriptions of the others options if beyond 30 characters if mentioned, and the item description itself should be always be referred to as "item description".\n
//   ${isTestEnv && "The index of the best option must be included in your response\n"}`,

// You may use general product knowledge and relationships implied by the wording of the descriptions (for example, understanding what products are covered by referenced headings).
// Do not assume or invent legal exclusions, notes, or interpretations beyond what is explicitly stated.
