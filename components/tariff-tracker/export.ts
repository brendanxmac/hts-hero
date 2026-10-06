import { Authority } from "../../tariffs/engine-v2/types";
import { adjustmentSummary } from "./adjustments";
import { programAuthority, UNITS, VALUE, TrackedProduct } from "./report";

// The Tariff Tracker report as a spreadsheet: one row per product (HTS code + country of
// origin), with a rate column and a column listing the tariffs (Chapter 99 headings) for
// each type of tariff that appears.
// The same sheet is written as CSV or as an Excel workbook.

type Kind = "text" | "pct" | "int";

export interface Column {
  header: string;
  kind: Kind;
  width: number; // characters, for Excel
}

// Percentages are in percent (25 means 25%)
export type Cell = string | number | null;

export interface Sheet {
  columns: Column[];
  rows: Cell[][];
}

// Tariff types in the order they're shown; only types that apply to something get columns
const TYPES: { authority: Authority; label: string }[] = [
  { authority: "122", label: "Section 122" },
  { authority: "232", label: "Section 232" },
  { authority: "301", label: "Section 301" },
  { authority: "201", label: "Section 201" },
  { authority: "IEEPA", label: "IEEPA" },
  { authority: "ADCVD", label: "AD/CVD" },
  { authority: "deal", label: "Trade agreements" },
  { authority: "other", label: "Other tariffs" },
];

const round = (value: number) => Math.round(value * 100) / 100;

const applied = (row: TrackedProduct) =>
  row.result.lines.filter((l) => l.status === "applies");

export const buildTariffSheet = (rows: TrackedProduct[], asOf: string): Sheet => {
  const types = TYPES.filter((t) =>
    rows.some((r) =>
      applied(r).some((l) => programAuthority(l.program) === t.authority),
    ),
  );

  const columns: Column[] = [
    { header: "HTS code", kind: "text", width: 15 },
    { header: "Country code", kind: "text", width: 9 },
    { header: "Country of origin", kind: "text", width: 18 },
    { header: "Base rate (HTS)", kind: "text", width: 22 },
    { header: "Base duty", kind: "pct", width: 11 },
    ...types.flatMap((t): Column[] => [
      { header: `${t.label} Rate`, kind: "pct", width: 13 },
      { header: `${t.label} Tariffs`, kind: "text", width: 34 },
    ]),
    { header: "Total duty rate", kind: "pct", width: 13 },
    { header: "Open questions", kind: "int", width: 10 },
    { header: "Adjustments", kind: "text", width: 34 },
    { header: "Notes", kind: "text", width: 40 },
    { header: "Rates as of", kind: "text", width: 12 },
  ];

  const body = rows.map((r): Cell[] => {
    const { result } = r;
    const typeCells = types.flatMap((t): Cell[] => {
      const lines = applied(r).filter(
        (l) => programAuthority(l.program) === t.authority,
      );
      if (lines.length === 0) return [null, null];
      return [
        round(lines.reduce((sum, l) => sum + (l.amount / r.customsValue) * 100, 0)),
        lines
          .map((l) => `${l.code} (${round(l.ratePct ?? 0)}%)`)
          .join("; "),
      ];
    });
    const notes = [
      ...(result.requiresQuantity
        ? [
            `Includes per-unit duty, shown for $${r.customsValue.toLocaleString("en-US")} and ${r.quantity.toLocaleString("en-US")} units`,
          ]
        : []),
      ...result.warnings,
    ];
    return [
      r.entry.element.htsno,
      r.entry.country.code,
      r.entry.country.name,
      result.base.reasons[0] ?? "Free",
      round((result.base.amount / r.customsValue) * 100),
      ...typeCells,
      round(r.totalPct),
      r.openQuestions,
      adjustmentSummary(r.adjustments, result) || null,
      notes.join(" ") || null,
      asOf,
    ];
  });

  return { columns, rows: body };
};

// ── CSV ──

const csvCell = (value: Cell) => {
  if (value === null) return "";
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const toCsv = (sheet: Sheet) =>
  // The byte order mark tells Excel it's UTF-8, so "›" and "¢" survive
  "﻿" +
  [
    sheet.columns
      .map((c) => csvCell(c.kind === "pct" ? `${c.header} (%)` : c.header))
      .join(","),
    ...sheet.rows.map((row) => row.map(csvCell).join(",")),
  ].join("\r\n");

// ── Excel ──
// A minimal Office Open XML workbook: the report sheet (bold, frozen header row, filters,
// percentages formatted as such) and a sheet explaining it.

const xml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const columnLetter = (index: number) => {
  let n = index + 1;
  let letters = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    letters = String.fromCharCode(65 + rem) + letters;
    n = Math.floor((n - 1) / 26);
  }
  return letters;
};

// Cell styles (indexes into cellXfs in styles.xml)
const STYLE = { text: 0, header: 1, pct: 2, title: 4, int: 0 };

const cellXml = (ref: string, value: Cell, kind: Kind | "header" | "title") => {
  if (value === null || value === "") return "";
  if (typeof value === "number") {
    // Excel stores 25% as 0.25
    const v = kind === "pct" ? Math.round(value * 1e4) / 1e6 : value;
    return `<c r="${ref}" s="${kind === "pct" ? STYLE.pct : STYLE.int}"><v>${v}</v></c>`;
  }
  const style =
    kind === "header"
      ? STYLE.header
      : kind === "title"
        ? STYLE.title
        : STYLE.text;
  return `<c r="${ref}" t="inlineStr" s="${style}"><is><t xml:space="preserve">${xml(value)}</t></is></c>`;
};

const reportSheetXml = (sheet: Sheet) => {
  const last = columnLetter(sheet.columns.length - 1);
  const header = `<row r="1" ht="30" customHeight="1">${sheet.columns
    .map((c, i) => cellXml(`${columnLetter(i)}1`, c.header, "header"))
    .join("")}</row>`;
  const body = sheet.rows
    .map(
      (row, r) =>
        `<row r="${r + 2}">${row.map((value, i) => cellXml(`${columnLetter(i)}${r + 2}`, value, sheet.columns[i].kind)).join("")}</row>`,
    )
    .join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" xSplit="1" topLeftCell="B2" activePane="bottomRight" state="frozen"/></sheetView></sheetViews>
<cols>${sheet.columns.map((c, i) => `<col min="${i + 1}" max="${i + 1}" width="${c.width}" customWidth="1"/>`).join("")}</cols>
<sheetData>${header}${body}</sheetData>
<autoFilter ref="A1:${last}${sheet.rows.length + 1}"/>
</worksheet>`;
};

const aboutSheetXml = (lines: [string, string][]) => {
  const rows = lines
    .map(
      ([label, value], i) =>
        `<row r="${i + 1}">${cellXml(`A${i + 1}`, label, i === 0 ? "title" : "header")}${cellXml(`B${i + 1}`, value, "text")}</row>`,
    )
    .join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<cols><col min="1" max="1" width="22" customWidth="1"/><col min="2" max="2" width="90" customWidth="1"/></cols>
<sheetData>${rows}</sheetData>
</worksheet>`;
};

const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="1"><numFmt numFmtId="164" formatCode="0.0#%"/></numFmts>
<fonts count="3">
<font><sz val="11"/><name val="Calibri"/></font>
<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
<font><b/><sz val="14"/><name val="Calibri"/></font>
</fonts>
<fills count="3">
<fill><patternFill patternType="none"/></fill>
<fill><patternFill patternType="gray125"/></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FF1B3A8C"/><bgColor indexed="64"/></patternFill></fill>
</fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="5">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"><alignment vertical="top"/></xf>
<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"><alignment vertical="top"/></xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

const WORKBOOK_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="Tariff report" sheetId="1" r:id="rId1"/><sheet name="About this report" sheetId="2" r:id="rId2"/></sheets>
</workbook>`;

const WORKBOOK_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

const ROOT_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;

export const toXlsx = (sheet: Sheet, asOf: string): Uint8Array => {
  const about: [string, string][] = [
    ["Tariff report", ""],
    ["Prepared with", "HTS Hero Tariff Tracker"],
    ["Rates as of", asOf],
    ["Products", String(sheet.rows.length)],
    [
      "Rates",
      "Each tariff is shown as a percentage of the customs value. The total is the sum of the base duty and every additional tariff that applies.",
    ],
    [
      "Tariffs",
      "The Chapter 99 headings behind each type of tariff, with the rate each one sets.",
    ],
    [
      "Per-unit rates",
      `Base rates charged per unit or per kilogram are converted to a percentage of each product's shipment: $${VALUE.toLocaleString("en-US")} of goods and ${UNITS.toLocaleString("en-US")} units unless adjusted.`,
    ],
    [
      "Adjustments",
      "What's been set for a product: its customs value, quantity, transport, the trade program claimed and the conditions answered. Its rates reflect them.",
    ],
    [
      "Open questions",
      "Exemptions and conditions that could change the rate. They count as not met until confirmed.",
    ],
    [
      "Not included",
      "Customs fees (MPF, HMF), antidumping and countervailing duties.",
    ],
  ];
  return zip([
    ["[Content_Types].xml", CONTENT_TYPES],
    ["_rels/.rels", ROOT_RELS],
    ["xl/workbook.xml", WORKBOOK_XML],
    ["xl/_rels/workbook.xml.rels", WORKBOOK_RELS],
    ["xl/styles.xml", STYLES_XML],
    ["xl/worksheets/sheet1.xml", reportSheetXml(sheet)],
    ["xl/worksheets/sheet2.xml", aboutSheetXml(about)],
  ]);
};

// ── Zip (stored, no compression; an .xlsx is a zip of XML files) ──

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

const crc32 = (data: Uint8Array) => {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++)
    crc = CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
};

const zip = (files: [string, string][]): Uint8Array => {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;

  files.forEach(([name, content]) => {
    const nameBytes = encoder.encode(name);
    const data = encoder.encode(content);
    const crc = crc32(data);

    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true); // local file header
    local.setUint16(4, 20, true); // version needed
    local.setUint16(8, 0, true); // stored
    local.setUint16(12, 0x21, true); // date: 1980-01-01
    local.setUint32(14, crc, true);
    local.setUint32(18, data.length, true);
    local.setUint32(22, data.length, true);
    local.setUint16(26, nameBytes.length, true);
    chunks.push(new Uint8Array(local.buffer), nameBytes, data);

    const entry = new DataView(new ArrayBuffer(46));
    entry.setUint32(0, 0x02014b50, true); // central directory header
    entry.setUint16(4, 20, true);
    entry.setUint16(6, 20, true);
    entry.setUint16(14, 0x21, true);
    entry.setUint32(16, crc, true);
    entry.setUint32(20, data.length, true);
    entry.setUint32(24, data.length, true);
    entry.setUint16(28, nameBytes.length, true);
    entry.setUint32(42, offset, true);
    central.push(new Uint8Array(entry.buffer), nameBytes);

    offset += 30 + nameBytes.length + data.length;
  });

  const centralSize = central.reduce((sum, c) => sum + c.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); // end of central directory
  end.setUint16(8, files.length, true);
  end.setUint16(10, files.length, true);
  end.setUint32(12, centralSize, true);
  end.setUint32(16, offset, true);

  const parts = [...chunks, ...central, new Uint8Array(end.buffer)];
  const out = new Uint8Array(parts.reduce((sum, p) => sum + p.length, 0));
  let at = 0;
  parts.forEach((p) => {
    out.set(p, at);
    at += p.length;
  });
  return out;
};

// ── Saving ──

export type ExportFormat = "csv" | "xlsx";

export const downloadReport = (
  rows: TrackedProduct[],
  asOf: string,
  format: ExportFormat,
) => {
  const sheet = buildTariffSheet(rows, asOf);
  const blob =
    format === "csv"
      ? new Blob([toCsv(sheet)], { type: "text/csv;charset=utf-8" })
      : // The zip is built in its own exactly-sized buffer
        new Blob([toXlsx(sheet, asOf).buffer as ArrayBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `tariff-report-${asOf}.${format}`;
  link.click();
  URL.revokeObjectURL(url);
};
