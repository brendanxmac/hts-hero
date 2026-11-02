// How long each beat of the launch teasers runs, in seconds. Kept apart from the templates (no
// fonts), so the registry can work out a post's length from its props: switching a teaser's
// visual off takes its beat out of the video entirely.

// LaunchTeaser: the hook, the punch line on its own, the product visual on its own, the reveal
export const TEASER = { hook: 3.4, punch: 2.8, visual: 4.6, reveal: 3.6 }

export const teaserSeconds = (showVisual = true) =>
  TEASER.hook + TEASER.punch + (showVisual ? TEASER.visual : 0) + TEASER.reveal

// LaunchMemo: the declassified memo comes in, then its lines type out one sentence at a time,
// and last the name and date. Its length follows the copy, so longer lines get more time to read.
export const MEMO = {
  enter: 0.8, // the sheet lands and its header is read
  cps: 40, // characters typed a second
  fade: 0.1, // each character fades in over this long, so the typing reads smooth
  hold: 0.5, // a typed sentence stays at least this long…
  read: 0.016, // …plus this long a character, so a long one gets more reading time
  turn: 0.4, // one sentence fades as the next starts
  end: 2.4, // the name and date come in and hold (the still)
}

// Old copy may still have [brackets] from when phrases were blacked out; they're just text now
export const memoText = (line: string) => line.replace(/[[\]]/g, "")

// The memo's lines as the sentences shown one at a time (a sentence ends at . ! or ? and a space)
export const memoSentences = (lines: string[]) =>
  lines.flatMap((line) => memoText(line).split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean))

// When each sentence starts and how long it stays, then when the ending comes
export const memoTimeline = (lines: string[]) => {
  let at = MEMO.enter
  const sentences = memoSentences(lines).map((text) => {
    const typed = text.length / MEMO.cps
    const length = typed + MEMO.fade + MEMO.hold + text.length * MEMO.read
    const sentence = { text, start: at, length }
    at += length + MEMO.turn
    return sentence
  })
  return { sentences, endAt: at, seconds: at + MEMO.end }
}

export const memoSeconds = (lines: string[]) => memoTimeline(lines).seconds

// LaunchSlam: three slammed lines, the blurred glimpse, the reveal
export const SLAM = { beat: 2.2, glimpse: 3.4, reveal: 3 }

export const slamSeconds = (showVisual = true) => SLAM.beat * 3 + (showVisual ? SLAM.glimpse : 0) + SLAM.reveal
