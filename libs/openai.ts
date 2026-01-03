import OpenAI from "openai";

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
