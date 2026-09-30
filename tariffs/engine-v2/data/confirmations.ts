import { Condition, InputDefinition, Tariff } from "../types"

// A yes/no question asking the user to confirm a heading applies to their goods.
// This carries over the legacy `requiresReview` flag: like before, the heading doesn't
// apply until confirmed. Where the underlying fact is known and reusable (a loading date,
// a trade preference claim), use a named input instead. See PROGRESS.md.
export const confirm = (code: string): Condition => ({
  kind: "answer",
  input: confirmInputId(code),
  equals: true,
})

export const confirmInputId = (code: string) => `confirm:${code}`

// One input definition per heading that uses `confirm()`, labeled from the heading
export const confirmationInputs = (tariffs: Tariff[]): InputDefinition[] => {
  const inputs = new Map<string, InputDefinition>()
  for (const tariff of tariffs) {
    for (const condition of tariff.requires ?? []) {
      if (condition.input === confirmInputId(tariff.code) && !inputs.has(tariff.code)) {
        inputs.set(tariff.code, {
          id: confirmInputId(tariff.code),
          label: `${tariff.code}: ${tariff.name}`,
          help: tariff.description,
          type: "boolean",
        })
      }
    }
  }
  return [...inputs.values()]
}
