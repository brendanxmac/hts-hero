import { describe, expect, it } from "../testing/test-runner";
import {
  extractionSchemaFor,
  getTradeDocumentType,
  groupedHeaderColumns,
  headerHasValues,
  parseExtractedDocument,
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

  it("returns an empty line list when none are found", () => {
    const type = getTradeDocumentType("bill_of_lading");
    const { header, lineItems } = parseExtractedDocument(type, {
      bl_number: "BL-1",
    });
    expect(header.bl_number).toBe("BL-1");
    expect(lineItems.length).toBe(0);
    expect(headerHasValues(header)).toBe(true);
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
    const properties = schema.properties as Record<
      string,
      {
        type?: string;
        description?: string;
        items?: {
          properties: Record<string, { type: string; description: string }>;
        };
      }
    >;
    const unitPrice = properties.line_items?.items?.properties.unit_price;
    const totalAmount = properties.total_amount;

    expect(unitPrice?.type).toBe("string");
    expect(totalAmount?.type).toBe("string");
    expect(Boolean(unitPrice?.description?.includes("exactly as printed"))).toBe(
      true
    );
    expect(Boolean(totalAmount?.description?.includes("exactly as printed"))).toBe(
      true
    );
  });

  it("asks for manufacturer and package fields on commercial invoices", () => {
    const schema = extractionSchemaFor(
      getTradeDocumentType("commercial_invoice")
    );
    const properties = schema.properties as Record<
      string,
      {
        description?: string;
        items?: {
          properties: Record<string, { description: string }>;
        };
      }
    >;
    const line = properties.line_items?.items?.properties ?? {};
    expect(Boolean(line.manufacturer_id)).toBe(true);
    expect(Boolean(line.gross_weight)).toBe(true);
    expect(Boolean(line.packages_count)).toBe(true);
    expect(Boolean(line.purchase_order_line)).toBe(true);
    expect(
      Boolean(line.manufacturer_id?.description.includes("Leave empty"))
    ).toBe(true);
    expect(Boolean(properties.ship_to_name)).toBe(true);
    expect(Boolean(properties.sold_to_name)).toBe(true);
  });
});

describe("groupedHeaderColumns", () => {
  it("groups commercial invoice header fields", () => {
    const type = getTradeDocumentType("commercial_invoice");
    const groups = groupedHeaderColumns(type.headerColumns);
    const names = groups.map((entry) => entry.group);
    expect(names.includes("parties")).toBe(true);
    expect(names.includes("references")).toBe(true);
    expect(
      groups
        .find((entry) => entry.group === "parties")
        ?.columns.some((column) => column.field === "manufacturer_id")
    ).toBe(true);
  });
});
