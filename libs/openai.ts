import OpenAI from "openai";
import { APIPromise } from "openai/core";
import { AutoParseableResponseFormat } from "openai/lib/parser";

export enum OpenAIModel {
  FIVE_ONE = "gpt-5.1-2025-11-13",
  FOUR = "gpt-4o",
  FOUR_MINI = "gpt-4o-mini",
  FOUR_LATEST = "gpt-4o-2024-11-20",
  FOUR_ONE = "gpt-4.1-2025-04-14",
}

export const getHSHeadings = (
  productDescription: string,
  model?: OpenAIModel
) => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  return openai.chat.completions.create({
    temperature: 0.7,
    top_p: 1.0,
    model: model || "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are ChatGPT, a large language model trained by OpenAI. Answer as helpfully and accurately as possible.",
      },
      {
        role: "user",
        content: `Use the General Rules for the Interpretation of the Harmonized System to determine which headings (at least 2) most accurately describe: ${productDescription}.
        Your response should:
        1. Be ONLY a raw array of objects where each object matches the following structure: { heading: "xxxx",  desciption: 'lorem ipsum...', logic: 'the reason why this heading makes sense...'}.
        2. Without the code block formatting indicating it is json`,
      },
    ],
  });
};

export const getUsHtsCode = (
  hsHeading: string,
  productDescription: string,
  model?: OpenAIModel
) => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  return openai.chat.completions.create({
    temperature: 0.7,
    top_p: 1.0,
    model: model || "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are ChatGPT, a large language model trained by OpenAI. Answer as helpfully and accurately as possible.",
      },
      {
        role: "user",
        content: `Use the General Rules for the Interpretation of the Harmonized System (HS), and HS heading ${hsHeading} to determine the most accurate full United States HTS code for: ${productDescription}.
        Your response should:
        1. Be ONLY a raw JSON response with two properties: 
        a. code: the full HTS code with format xxxx.xx.xx.xx
        b. logic: your reasoning for WHY you chose this code
        2. Not contain the code block formatting indicating it is json`,
      },
    ],
  });
};

export const bestStringMatch = (
  htsDescription: string,
  strings: string[],
  productDescription: string,
  model?: OpenAIModel
) => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  return openai.chat.completions.create({
    temperature: 0.7,
    top_p: 1.0,
    model: model || "gpt-4o-mini", // TODO: see if other models help improve this
    messages: [
      {
        role: "system",
        content:
          "You are ChatGPT, a large language model trained by OpenAI. Answer as helpfully and accurately as possible.",
      },
      {
        role: "user",
        content: `For the given description:${htsDescription}
        If one of the following descriptions were added onto it, which one, when combined, would most accurately classify / describe a ${productDescription}:
        ${strings.join("\n")}
        Your response should:
        1. Be ONLY a raw JSON response with two properties: 
        a. description: the pure, entirely unchanged original string from the list that is the best match (especially do NOT remove any punctuation marks)
        b. logic: your reasoning for WHY you chose this string
        2. Not contain the code block formatting indicating it is json`,
      },
    ],
  });
};

export const getBestClassificationProgressionStandard = (
  responseFormat: AutoParseableResponseFormat<{
    index?: number;
    analysis?: string;
  }>,
  productDescription: string,
  htsDescription: string,
  labelledDescriptions: string[]
): APIPromise<OpenAI.Chat.Completions.ChatCompletion> => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
          You must pick a single description. If option sounds suitable and "Other" is available as an option, you should pick it.\n
          Note: The use of semicolons (;) in the descriptions should be interpreted as "or" for example "mangoes;mangosteens" would be interpreted as "mangoes or mangosteens".\n
          In your response, "logic" for your selection should explain why the description you picked is the most suitable match.\n
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

export const getBestClassificationProgressionPremium = (
  responseFormat: AutoParseableResponseFormat<{
    index?: number;
    analysis?: string;
  }>,
  productDescription: string,
  htsDescription: string,
  labelledDescriptions: string[],
  notes: string[],
  griRules: string[]
) => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
          You must pick a single description. If option sounds suitable and "Other" is available as an option, you should pick it.\n
          Note: The use of semicolons (;) in the descriptions should be interpreted as "or" for example "mangoes;mangosteens" would be interpreted as "mangoes or mangosteens".\n
          In your response, "logic" for your selection should explain why the description you picked is the most suitable match.\n
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
