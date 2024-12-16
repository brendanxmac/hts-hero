import { createInterface } from "readline";
import { HtsWithParentReference } from "../interfaces/hts";

export const elementsAtIndentLevel = (
  elements: HtsWithParentReference[],
  indentLevel: number
) => {
  return elements.filter((e) => Number(e.indent) === indentLevel);
};

export const promptUser = (question: string): Promise<string> => {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer: string) => {
      rl.close();
      resolve(answer);
    });
  });
};

export const setIndexInArray = <T extends Object>(
  elements: T[]
): Array<T & { indexInParentArray: number }> => {
  return elements.map((e, i) => ({ ...e, indexInParentArray: i }));
};
