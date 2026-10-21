// node extract.mjs <revision> : download finalCopy PDF, write txt/<rev>.txt with ch 1–98 tariff-table lines
import { existsSync, readFileSync, writeFileSync } from "fs"
import { extractText, getDocumentProxy } from "../../../node_modules/unpdf/dist/index.mjs"
const rev = process.argv[2]
const pdfPath = `pdf/${rev}.pdf`
if (!existsSync(pdfPath)) {
  const r = await fetch(`https://hts.usitc.gov/reststop/file?release=${rev}&filename=finalCopy`)
  const b = new Uint8Array(await r.arrayBuffer())
  if (!r.ok || String.fromCharCode(...b.slice(0, 5)) !== "%PDF-") { console.error(`${rev}: no PDF (${r.status})`); process.exit(1) }
  writeFileSync(pdfPath, b)
}
const pdf = await getDocumentProxy(new Uint8Array(readFileSync(pdfPath)))
const { text } = await extractText(pdf, { mergePages: false })
const out = []
let kept = 0
for (const page of text) {
  if (!page.includes("Article Description") || !page.includes("Heading/")) continue
  const lines = page.split("\n").map((l) => l.trim()).filter(Boolean)
  const footer = lines[lines.length - 1].match(/^(\d{1,2})\s*-\s*\d+$/)
  if (!footer || Number(footer[1]) >= 99) continue
  kept++
  for (let line of lines.slice(0, -2)) {
    line = line.replace(/\.{2,}/g, "").replace(/\s+/g, "")
    if (!line || /HarmonizedTariffSchedule|AnnotatedforStatistical/i.test(line) || /^[IVX]+$/.test(line)) continue
    out.push(`${footer[1]}|${line}`)
  }
}
writeFileSync(`txt/${rev}.txt`, out.join("\n") + "\n")
console.log(`${rev}: ${text.length} pages, ${kept} ch1-98 table pages, ${out.length} lines`)
