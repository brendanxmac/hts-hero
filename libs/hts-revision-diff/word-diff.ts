// Word-level diff between two texts (longest common subsequence on words,
// after trimming the shared start and end, which is where most of a long
// note's text is)

import type { WordOp } from "./types"

// Cells in the LCS table above this, the middle is shown as one replacement
const MAX_TABLE_CELLS = 4_000_000

const tokenize = (text: string) => text.split(/\s+/).filter(Boolean)

export const wordDiff = (before: string, after: string): WordOp[] => {
  const a = tokenize(before)
  const b = tokenize(after)

  let start = 0
  while (start < a.length && start < b.length && a[start] === b[start]) start++
  let endA = a.length
  let endB = b.length
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA--
    endB--
  }

  const ops: WordOp[] = []
  const push = (op: WordOp["op"], words: string[]) => {
    if (!words.length) return
    const last = ops[ops.length - 1]
    if (last && last.op === op) last.text += ` ${words.join(" ")}`
    else ops.push({ op, text: words.join(" ") })
  }

  push("eq", a.slice(0, start))

  const midA = a.slice(start, endA)
  const midB = b.slice(start, endB)
  if (midA.length * midB.length > MAX_TABLE_CELLS) {
    push("del", midA)
    push("add", midB)
  } else {
    // lcs[i][j] = LCS length of midA[i..] and midB[j..]
    const n = midA.length
    const m = midB.length
    const lcs: Uint32Array[] = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1))
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        lcs[i][j] =
          midA[i] === midB[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1])
      }
    }
    let i = 0
    let j = 0
    while (i < n && j < m) {
      if (midA[i] === midB[j]) {
        push("eq", [midA[i]])
        i++
        j++
      } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
        push("del", [midA[i]])
        i++
      } else {
        push("add", [midB[j]])
        j++
      }
    }
    push("del", midA.slice(i))
    push("add", midB.slice(j))
  }

  push("eq", a.slice(endA))
  return ops
}

// "[-old-]{+new+}" form, for prompts and markdown exports. Long unchanged
// stretches are shortened to their ends.
export const renderWordDiff = (ops: WordOp[], keepEq = 40) =>
  ops
    .map((op) => {
      if (op.op === "add") return `{+${op.text}+}`
      if (op.op === "del") return `[-${op.text}-]`
      const words = op.text.split(" ")
      if (words.length <= keepEq * 2) return op.text
      return `${words.slice(0, keepEq).join(" ")} … ${words.slice(-keepEq).join(" ")}`
    })
    .join(" ")
