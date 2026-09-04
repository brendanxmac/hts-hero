import { describe, expect, it } from "../testing/test-runner";
import {
  addHeaderColumnToTemplate,
  applyColumnEdit,
  buildGridRows,
  duplicateExportNames,
  parseExportTemplateStore,
  persistWorkingTemplate,
  populatedLineItemFields,
  resolveTemplateForExtract,
  saveAsNamedTemplate,
  templateFromEntry,
  templateFromFound,
  templateFromForwarding,
} from "./export-templates";
import { getTradeDocumentType } from "./trade-documents";

describe("templateFromFound", () => {
  it("keeps only line columns that have a value", () => {
    const type = getTradeDocumentType("commercial_invoice");
    const template = templateFromFound(type, [
      { sku: "A-1", description: "Widget", hs_code: "", quantity: 2 },
    ]);

    const fields = template.columns.map((column) =>
      column.source.kind === "line" ? column.source.field : column.id
    );
    expect(fields.includes("sku")).toBe(true);
    expect(fields.includes("description")).toBe(true);
    expect(fields.includes("quantity")).toBe(true);
    expect(fields.includes("hs_code")).toBe(false);
    expect(fields.includes("net_weight")).toBe(false);
  });
});

describe("templateFromEntry", () => {
  it("keeps required entry columns even when they are empty", () => {
    const type = getTradeDocumentType("commercial_invoice");
    const template = templateFromEntry(type);
    const fields = template.columns
      .filter((column) => column.source.kind === "line")
      .map((column) =>
        column.source.kind === "line" ? column.source.field : ""
      );

    expect(fields.includes("hs_code")).toBe(true);
    expect(fields.includes("manufacturer_id")).toBe(true);
    expect(template.transforms.includes("htsPad10")).toBe(true);
  });

  it("skips fields that do not exist on packing lists", () => {
    const type = getTradeDocumentType("packing_list");
    const template = templateFromEntry(type);
    const fields = template.columns.map((column) =>
      column.source.kind === "line" || column.source.kind === "header"
        ? column.source.field
        : column.id
    );
    expect(fields.includes("unit_price")).toBe(false);
    expect(fields.includes("description")).toBe(true);
  });
});

describe("templateFromForwarding", () => {
  it("uses carton fields for packing lists", () => {
    const type = getTradeDocumentType("packing_list");
    const template = templateFromForwarding(type);
    const fields = template.columns.map((column) =>
      column.source.kind === "line" || column.source.kind === "header"
        ? column.source.field
        : column.id
    );
    expect(fields.includes("carton_number")).toBe(true);
    expect(fields.includes("gross_weight")).toBe(true);
  });
});

describe("buildGridRows", () => {
  it("repeats header values without stripping custom row keys", () => {
    const header = { invoice_number: "INV-9" };
    const rows = buildGridRows(
      header,
      [{ description: "Goods", _rowId: "1", extra: "keep" }],
      [
        {
          id: "line:description",
          source: { kind: "line", field: "description" },
          headerName: "Description",
        },
        {
          id: "header:invoice_number",
          source: { kind: "header", field: "invoice_number" },
          headerName: "Invoice Number",
        },
      ],
      {}
    );

    expect(rows[0].description == null || rows[0]["line:description"] === "Goods").toBe(
      true
    );
    expect(rows[0]["line:description"]).toBe("Goods");
    expect(rows[0]["header:invoice_number"]).toBe("INV-9");
  });

  it("does not overwrite an edited header cell when the header changes", () => {
    const rows = buildGridRows(
      { invoice_number: "NEW" },
      [{ _rowId: "1", "header:invoice_number": "EDITED" }],
      [
        {
          id: "header:invoice_number",
          source: { kind: "header", field: "invoice_number" },
          headerName: "Invoice Number",
        },
      ],
      { "1:header:invoice_number": true }
    );

    expect(rows[0]["header:invoice_number"]).toBe("EDITED");
  });
});

describe("applyColumnEdit", () => {
  it("writes line edits back to the source field", () => {
    const next = applyColumnEdit(
      [{ _rowId: "1", description: "Old" }],
      "1",
      {
        id: "line:description",
        source: { kind: "line", field: "description" },
        headerName: "Description",
      },
      "New"
    );
    expect(next[0].description).toBe("New");
    expect(next[0]["line:description"]).toBe("New");
  });
});

describe("addHeaderColumnToTemplate", () => {
  it("adds a header field as a column", () => {
    const type = getTradeDocumentType("commercial_invoice");
    const template = templateFromFound(type, [{ sku: "A" }]);
    const next = addHeaderColumnToTemplate(type, template, "invoice_number");
    expect(
      next.columns.some(
        (column) =>
          column.source.kind === "header" &&
          column.source.field === "invoice_number"
      )
    ).toBe(true);
    expect(next.dirty).toBe(true);
  });
});

describe("duplicateExportNames", () => {
  it("finds duplicate visible export names", () => {
    const duplicates = duplicateExportNames([
      {
        id: "a",
        source: { kind: "blank" },
        headerName: "ItemCode",
      },
      {
        id: "b",
        source: { kind: "blank" },
        headerName: "ItemCode",
      },
      {
        id: "c",
        source: { kind: "blank" },
        headerName: "Qty",
        hidden: true,
      },
    ]);
    expect(duplicates.includes("itemcode")).toBe(true);
  });
});

describe("resolveTemplateForExtract", () => {
  it("uses a dirty found draft instead of regenerating", () => {
    const type = getTradeDocumentType("commercial_invoice");
    const draft = templateFromFound(type, [{ sku: "A" }]);
    draft.dirty = true;
    draft.columns.push({
      id: "blank:1",
      source: { kind: "blank" },
      headerName: "Notes",
    });
    const resolved = resolveTemplateForExtract(type, [{ description: "X" }], {
      templates: [],
      drafts: { commercial_invoice: draft },
      lastTemplateIdByType: { commercial_invoice: "preset:found" },
    });
    expect(resolved.columns.some((column) => column.headerName === "Notes")).toBe(
      true
    );
  });

  it("regenerates an unmodified found template from new data", () => {
    const type = getTradeDocumentType("commercial_invoice");
    const resolved = resolveTemplateForExtract(
      type,
      [{ description: "Only desc" }],
      {
        templates: [],
        drafts: {},
        lastTemplateIdByType: {},
      }
    );
    expect(resolved.presetId).toBe("found");
    expect(resolved.columns.length).toBe(1);
  });
});

describe("persist and save templates", () => {
  it("round-trips stored JSON", () => {
    const type = getTradeDocumentType("bill_of_lading");
    const template = templateFromEntry(type);
    const stored = persistWorkingTemplate(
      { templates: [], drafts: {}, lastTemplateIdByType: {} },
      template
    );
    const parsed = parseExportTemplateStore(JSON.parse(JSON.stringify(stored)));
    expect(parsed.lastTemplateIdByType.bill_of_lading).toBe("preset:entry");
    expect(parsed.drafts.bill_of_lading?.presetId).toBe("entry");
  });

  it("save as creates a named copy", () => {
    const type = getTradeDocumentType("commercial_invoice");
    const { template, store } = saveAsNamedTemplate(
      { templates: [], drafts: {}, lastTemplateIdByType: {} },
      templateFromEntry(type),
      "CW invoice lines"
    );
    expect(template.name).toBe("CW invoice lines");
    expect(template.id === "preset:entry").toBe(false);
    expect(store.templates.length).toBe(1);
  });
});

describe("populatedLineItemFields", () => {
  it("ignores blank strings", () => {
    const type = getTradeDocumentType("packing_list");
    const fields = populatedLineItemFields(type, [
      { sku: "  ", carton_number: "1-4" },
    ]);
    expect(fields.map((column) => column.field).includes("carton_number")).toBe(
      true
    );
    expect(fields.map((column) => column.field).includes("sku")).toBe(false);
  });
});
