import { describe, expect, it } from "../testing/test-runner";
import {
  applyHeaderFieldsToLineItems,
  columnsForLineItems,
  duplicateExportNames,
  extractionSchemaFor,
  getTradeDocumentType,
  parseExtractedDocument,
  resolveColumnNames,
} from "./trade-documents";

describe("parseExtractedDocument", () => {
  it("parses a packing list into header and line items", () => {
    const type = getTradeDocumentType("packing_list");
    const { header, lineItems } = parseExtractedDocument(type, {
      packing_list_number: "PL-9",
      seller_name: "Acme",
      packing_list_number_score: 0.9,
      line_items: [
        {
          sku: "A-1",
          carton_number: "1-4",
          net_weight: 12.5,
        },
      ],
    });

    expect(header.packing_list_number).toBe("PL-9");
    expect(header.seller_name).toBe("Acme");
    expect(lineItems.length).toBe(1);
    expect(lineItems[0].sku).toBe("A-1");
    expect(lineItems[0].carton_number).toBe("1-4");
    expect(lineItems[0].net_weight).toBe(12.5);
  });

  it("keeps printed currency strings on money fields", () => {
    const type = getTradeDocumentType("commercial_invoice");
    const { lineItems } = parseExtractedDocument(type, {
      line_items: [{ unit_price: "$1,234.50", line_amount: "€ 2.000,00" }],
    });

    expect(lineItems[0].unit_price).toBe("$1,234.50");
    expect(lineItems[0].line_amount).toBe("€ 2.000,00");
  });

  it("parses a bill of lading container line", () => {
    const type = getTradeDocumentType("bill_of_lading");
    const { header, lineItems } = parseExtractedDocument(type, {
      bl_number: "EGLV123",
      vessel_name: "Ever Given",
      line_items: [
        {
          container_number: "TEMU1234567",
          description: "Batteries",
        },
      ],
    });

    expect(header.bl_number).toBe("EGLV123");
    expect(header.vessel_name).toBe("Ever Given");
    expect(lineItems[0].container_number).toBe("TEMU1234567");
  });
});

describe("applyHeaderFieldsToLineItems", () => {
  it("copies selected header fields onto each line", () => {
    const type = getTradeDocumentType("bill_of_lading");
    const rows = applyHeaderFieldsToLineItems(
      type,
      { bl_number: "BL-1", vessel_name: "Atlantic" },
      [{ description: "Goods", _rowId: "1" }],
      ["bl_number"]
    );

    expect(rows[0].bl_number).toBe("BL-1");
    expect(rows[0].description).toBe("Goods");
    expect(rows[0]._rowId).toBe("1");
    expect(rows[0].vessel_name == null || rows[0].vessel_name === "").toBeTruthy();
  });
});

describe("resolveColumnNames", () => {
  it("uses overrides for export names and finds duplicates", () => {
    const type = getTradeDocumentType("commercial_invoice");
    const columns = columnsForLineItems(type, []);
    const names = resolveColumnNames(columns, {
      sku: "ItemCode",
      description: "ItemCode",
    });

    expect(names.sku).toBe("ItemCode");
    expect(names.hs_code).toBe("HS / HTS Code");
    expect(duplicateExportNames(columns, names).includes("itemcode")).toBe(
      true
    );
  });
});

describe("extractionSchemaFor", () => {
  it("includes line_items for every document type", () => {
    for (const id of [
      "commercial_invoice",
      "packing_list",
      "bill_of_lading",
    ] as const) {
      const schema = extractionSchemaFor(getTradeDocumentType(id));
      expect(Boolean(schema.properties.line_items)).toBe(true);
    }
  });

  it("extracts amounts as strings so printed formatting is kept", () => {
    const schema = extractionSchemaFor(
      getTradeDocumentType("commercial_invoice")
    );
    const unitPrice = schema.properties.line_items.items.properties.unit_price;
    const totalAmount = schema.properties.total_amount;

    expect(unitPrice.type).toBe("string");
    expect(totalAmount.type).toBe("string");
    expect(unitPrice.description.includes("exactly as printed")).toBe(true);
    expect(totalAmount.description.includes("exactly as printed")).toBe(true);
  });
});
