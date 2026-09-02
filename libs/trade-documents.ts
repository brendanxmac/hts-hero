export type DocumentCellValue = string | number;

export type DocumentRow = Record<string, DocumentCellValue>;

export interface DocumentColumn {
  field: string;
  headerName: string;
  description: string;
  valueType?: "string" | "number";
}

export type TradeDocumentTypeId =
  | "commercial_invoice"
  | "packing_list"
  | "bill_of_lading";

export interface TradeDocumentType {
  id: TradeDocumentTypeId;
  label: string;
  description: string;
  csvFileName: string;
  lineItemsDescription: string;
  headerColumns: DocumentColumn[];
  lineItemColumns: DocumentColumn[];
}

export const ROW_ID_FIELD = "_rowId";

const stringCol = (
  field: string,
  headerName: string,
  description: string
): DocumentColumn => ({ field, headerName, description });

/** Extract as a string so Datalab keeps commas, decimals, and currency symbols. */
const numberCol = (
  field: string,
  headerName: string,
  description: string
): DocumentColumn =>
  stringCol(
    field,
    headerName,
    `${description}. Keep the value exactly as printed on the document, including currency symbols, thousands separators, and decimal places if present`
  );

const COMMERCIAL_INVOICE: TradeDocumentType = {
  id: "commercial_invoice",
  label: "Commercial Invoice",
  description: "Goods, prices, and parties for entry, payment, and classification.",
  csvFileName: "commercial-invoice.csv",
  lineItemsDescription: "Product line items listed on the commercial invoice",
  headerColumns: [
    stringCol("invoice_number", "Invoice Number", "Commercial invoice number or invoice ID printed on the document"),
    stringCol("invoice_date", "Invoice Date", "Invoice date as written on the document (prefer ISO YYYY-MM-DD when possible)"),
    stringCol("purchase_order_number", "PO Number", "Buyer purchase order number, PO number, or customer order reference"),
    stringCol("currency", "Currency", "Invoice currency code or name (e.g. USD, EUR)"),
    stringCol("incoterms", "Incoterms", "Incoterms / delivery terms (e.g. FOB, CIF, EXW, DDP) including named place if present"),
    stringCol("payment_terms", "Payment Terms", "Payment terms (e.g. T/T, net 30, letter of credit)"),
    stringCol("seller_name", "Seller Name", "Seller, exporter, or shipper company name"),
    stringCol("seller_address", "Seller Address", "Full seller / exporter street address"),
    stringCol("seller_country", "Seller Country", "Seller / exporter country"),
    stringCol("seller_tax_id", "Seller Tax ID", "Seller tax ID, VAT number, EORI, or similar tax identifier"),
    stringCol("buyer_name", "Buyer Name", "Buyer or importer company name"),
    stringCol("buyer_address", "Buyer Address", "Full buyer / importer street address"),
    stringCol("buyer_country", "Buyer Country", "Buyer / importer country"),
    stringCol("buyer_tax_id", "Buyer Tax ID", "Buyer tax ID, VAT number, EORI, or similar tax identifier"),
    stringCol("consignee_name", "Consignee Name", "Consignee name if listed separately from the buyer"),
    stringCol("consignee_address", "Consignee Address", "Consignee address if listed"),
    stringCol("country_of_export", "Country of Export", "Country of export or country from which the goods are shipped"),
    stringCol("country_of_destination", "Country of Destination", "Country of destination or country of import"),
    stringCol("port_of_loading", "Port of Loading", "Port of loading, airport of departure, or place of loading"),
    stringCol("port_of_discharge", "Port of Discharge", "Port of discharge, airport of arrival, or place of delivery"),
    stringCol("bill_of_lading_number", "Bill of Lading", "Bill of lading, air waybill, or other transport document number"),
    numberCol("total_packages", "Total Packages", "Total number of packages, cartons, or pallets"),
    numberCol("total_net_weight", "Total Net Weight", "Total net weight of the shipment"),
    numberCol("total_gross_weight", "Total Gross Weight", "Total gross weight of the shipment"),
    stringCol("weight_unit", "Weight Unit", "Unit of weight used on the invoice (e.g. KG, LB)"),
    numberCol("freight_amount", "Freight", "Freight / shipping charges"),
    numberCol("insurance_amount", "Insurance", "Insurance charges"),
    numberCol("subtotal", "Subtotal", "Merchandise subtotal before freight, insurance, and tax"),
    numberCol("total_amount", "Total Amount", "Invoice grand total / amount due"),
  ],
  lineItemColumns: [
    stringCol("line_number", "Line Number", "Line item number or row number on the invoice"),
    stringCol("sku", "SKU", "SKU, part number, item code, article number, or product identifier"),
    stringCol("description", "Description", "Product description or goods description for the line item"),
    stringCol("hs_code", "HS / HTS Code", "HS code, HTS code, tariff code, or harmonized code for the line item"),
    stringCol("country_of_origin", "Country of Origin", "Country of origin for the line item (ISO name or code)"),
    numberCol("quantity", "Quantity", "Quantity of units for the line item"),
    stringCol("unit_of_measure", "UOM", "Unit of measure (e.g. PCS, KG, CTN, SET)"),
    numberCol("unit_price", "Unit Price", "Unit price / price per unit"),
    numberCol("line_amount", "Line Amount", "Line total / amount for the line item (quantity × unit price)"),
    numberCol("net_weight", "Net Weight", "Net weight for the line item"),
  ],
};

const PACKING_LIST: TradeDocumentType = {
  id: "packing_list",
  label: "Packing List",
  description: "Cartons, weights, marks, and contents for warehouse and cargo handling.",
  csvFileName: "packing-list.csv",
  lineItemsDescription: "Packed goods / carton lines listed on the packing list",
  headerColumns: [
    stringCol("packing_list_number", "Packing List Number", "Packing list number or packing list ID printed on the document"),
    stringCol("packing_list_date", "Packing List Date", "Packing list date as written (prefer ISO YYYY-MM-DD when possible)"),
    stringCol("invoice_number", "Invoice Number", "Related commercial invoice number if printed on the packing list"),
    stringCol("purchase_order_number", "PO Number", "Buyer purchase order number or customer order reference"),
    stringCol("seller_name", "Seller Name", "Seller, exporter, or shipper company name"),
    stringCol("seller_address", "Seller Address", "Full seller / exporter street address"),
    stringCol("seller_country", "Seller Country", "Seller / exporter country"),
    stringCol("buyer_name", "Buyer Name", "Buyer or importer company name"),
    stringCol("buyer_address", "Buyer Address", "Full buyer / importer street address"),
    stringCol("buyer_country", "Buyer Country", "Buyer / importer country"),
    stringCol("consignee_name", "Consignee Name", "Consignee name if listed separately from the buyer"),
    stringCol("consignee_address", "Consignee Address", "Consignee address if listed"),
    stringCol("country_of_origin", "Country of Origin", "Shipment-level country of origin if stated on the packing list"),
    stringCol("country_of_destination", "Country of Destination", "Country of destination or country of import"),
    stringCol("port_of_loading", "Port of Loading", "Port of loading, airport of departure, or place of loading"),
    stringCol("port_of_discharge", "Port of Discharge", "Port of discharge, airport of arrival, or place of delivery"),
    stringCol("vessel_or_flight", "Vessel / Flight", "Vessel name, voyage, or flight number if listed"),
    stringCol("bill_of_lading_number", "Bill of Lading", "Bill of lading, air waybill, or other transport document number"),
    numberCol("total_packages", "Total Packages", "Total number of packages, cartons, or pallets"),
    numberCol("total_net_weight", "Total Net Weight", "Total net weight of the shipment"),
    numberCol("total_gross_weight", "Total Gross Weight", "Total gross weight of the shipment"),
    stringCol("weight_unit", "Weight Unit", "Unit of weight used on the packing list (e.g. KG, LB)"),
    numberCol("total_volume", "Total Volume", "Total volume or measurement of the shipment"),
    stringCol("volume_unit", "Volume Unit", "Unit of volume (e.g. CBM, CFT)"),
    stringCol("marks_and_numbers", "Marks & Numbers", "Shipping marks, carton marks, or marks and numbers for the shipment"),
  ],
  lineItemColumns: [
    stringCol("line_number", "Line Number", "Line item number or row number on the packing list"),
    stringCol("carton_number", "Carton / Package No.", "Carton number, package number, or package range (e.g. 1-10)"),
    stringCol("marks_and_numbers", "Marks & Numbers", "Shipping marks or carton marks for this line"),
    stringCol("sku", "SKU", "SKU, part number, item code, article number, or product identifier"),
    stringCol("description", "Description", "Product description or goods description for the packed line"),
    stringCol("hs_code", "HS / HTS Code", "HS code, HTS code, tariff code, or harmonized code for the line"),
    stringCol("country_of_origin", "Country of Origin", "Country of origin for the packed goods"),
    numberCol("quantity", "Quantity", "Quantity of units in this carton or line"),
    stringCol("unit_of_measure", "UOM", "Unit of measure (e.g. PCS, KG, CTN, SET)"),
    numberCol("net_weight", "Net Weight", "Net weight for this carton or line"),
    numberCol("gross_weight", "Gross Weight", "Gross weight for this carton or line"),
    stringCol("dimensions", "Dimensions", "Carton or package dimensions as written (L x W x H)"),
    numberCol("volume", "Volume", "Volume or measurement for this carton or line"),
  ],
};

const BILL_OF_LADING: TradeDocumentType = {
  id: "bill_of_lading",
  label: "Bill of Lading",
  description: "Shipper, consignee, vessel, containers, and cargo for transport and entry.",
  csvFileName: "bill-of-lading.csv",
  lineItemsDescription: "Cargo lines, container lines, or goods descriptions listed on the bill of lading",
  headerColumns: [
    stringCol("bl_number", "B/L Number", "Bill of lading number, B/L number, or ocean bill of lading number"),
    stringCol("bl_date", "B/L Date", "Bill of lading date or issue date (prefer ISO YYYY-MM-DD when possible)"),
    stringCol("bl_type", "B/L Type", "Type of bill of lading if stated (master, house, ocean, seaway, original, copy)"),
    stringCol("booking_number", "Booking Number", "Booking number or reservation number"),
    stringCol("shipper_name", "Shipper Name", "Shipper or exporter company name"),
    stringCol("shipper_address", "Shipper Address", "Full shipper / exporter street address"),
    stringCol("shipper_country", "Shipper Country", "Shipper / exporter country"),
    stringCol("consignee_name", "Consignee Name", "Consignee name as listed on the bill of lading"),
    stringCol("consignee_address", "Consignee Address", "Consignee address as listed"),
    stringCol("consignee_country", "Consignee Country", "Consignee country"),
    stringCol("notify_party_name", "Notify Party", "Notify party name"),
    stringCol("notify_party_address", "Notify Party Address", "Notify party address"),
    stringCol("carrier_name", "Carrier", "Ocean carrier, shipping line, or NVOCC name"),
    stringCol("vessel_name", "Vessel", "Vessel name"),
    stringCol("voyage_number", "Voyage", "Voyage number"),
    stringCol("place_of_receipt", "Place of Receipt", "Place of receipt or place of taking in charge"),
    stringCol("port_of_loading", "Port of Loading", "Port of loading"),
    stringCol("port_of_discharge", "Port of Discharge", "Port of discharge"),
    stringCol("place_of_delivery", "Place of Delivery", "Place of delivery or final destination"),
    stringCol("freight_terms", "Freight Terms", "Freight prepaid, collect, or other freight payment terms"),
    stringCol("incoterms", "Incoterms", "Incoterms if listed on the bill of lading"),
    numberCol("freight_amount", "Freight Amount", "Freight charges if listed"),
    stringCol("invoice_number", "Invoice Number", "Related commercial invoice number if listed"),
    stringCol("purchase_order_number", "PO Number", "Purchase order number if listed"),
    stringCol("container_numbers", "Container Numbers", "All container numbers listed on the bill of lading"),
    stringCol("seal_numbers", "Seal Numbers", "Container seal numbers listed on the bill of lading"),
    numberCol("total_packages", "Total Packages", "Total number of packages as stated on the B/L"),
    numberCol("total_gross_weight", "Total Gross Weight", "Total gross weight of the cargo"),
    stringCol("weight_unit", "Weight Unit", "Unit of weight (e.g. KG, LB, KGS, MT)"),
    numberCol("total_volume", "Total Volume", "Total measurement / volume of the cargo"),
    stringCol("volume_unit", "Volume Unit", "Unit of volume (e.g. CBM, CFT)"),
  ],
  lineItemColumns: [
    stringCol("line_number", "Line Number", "Cargo line number or row number on the bill of lading"),
    stringCol("marks_and_numbers", "Marks & Numbers", "Shipping marks and numbers for this cargo line"),
    stringCol("description", "Description of Goods", "Description of goods for this cargo line"),
    stringCol("hs_code", "HS / HTS Code", "HS code or tariff classification if listed for the goods"),
    stringCol("container_number", "Container Number", "Container number for this cargo line"),
    stringCol("seal_number", "Seal Number", "Seal number for the container on this line"),
    numberCol("packages_count", "Packages", "Number of packages for this cargo line"),
    stringCol("package_type", "Package Type", "Kind of packages (e.g. CTNS, PKGS, PALLETS, DRUMS)"),
    numberCol("quantity", "Quantity", "Quantity of units if listed separately from package count"),
    stringCol("unit_of_measure", "UOM", "Unit of measure if listed"),
    numberCol("net_weight", "Net Weight", "Net weight for this cargo line"),
    numberCol("gross_weight", "Gross Weight", "Gross weight for this cargo line"),
    numberCol("volume", "Volume", "Measurement or volume for this cargo line"),
  ],
};

export const TRADE_DOCUMENT_TYPES: TradeDocumentType[] = [
  COMMERCIAL_INVOICE,
  PACKING_LIST,
  BILL_OF_LADING,
];

const TRADE_DOCUMENT_TYPE_MAP = new Map(
  TRADE_DOCUMENT_TYPES.map((type) => [type.id, type])
);

export function isTradeDocumentTypeId(
  value: unknown
): value is TradeDocumentTypeId {
  return (
    value === "commercial_invoice" ||
    value === "packing_list" ||
    value === "bill_of_lading"
  );
}

export function getTradeDocumentType(
  id: TradeDocumentTypeId
): TradeDocumentType {
  const type = TRADE_DOCUMENT_TYPE_MAP.get(id);
  if (!type) {
    throw new Error(`Unknown document type: ${id}`);
  }
  return type;
}

function schemaProperties(columns: DocumentColumn[]) {
  return Object.fromEntries(
    columns.map((column) => [
      column.field,
      {
        type: column.valueType ?? "string",
        description: column.description,
      },
    ])
  );
}

export function extractionSchemaFor(type: TradeDocumentType) {
  return {
    type: "object",
    properties: {
      ...schemaProperties(type.headerColumns),
      line_items: {
        type: "array",
        description: type.lineItemsDescription,
        items: {
          type: "object",
          properties: schemaProperties(type.lineItemColumns),
        },
      },
    },
  };
}

function isMetaKey(key: string): boolean {
  return (
    key.endsWith("_citations") ||
    key.endsWith("_score") ||
    key.endsWith("_meta")
  );
}

function sanitizeValue(value: unknown): DocumentCellValue {
  if (value == null) {
    return "";
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : "";
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  if (typeof value === "string") {
    return value;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function emptyRowFrom(columns: DocumentColumn[]): DocumentRow {
  return Object.fromEntries(columns.map((column) => [column.field, ""]));
}

function fieldSet(columns: DocumentColumn[]): Set<string> {
  return new Set(columns.map((column) => column.field));
}

function assignKnownFields(
  target: DocumentRow,
  source: Record<string, unknown>,
  allowedFields: Set<string>
) {
  for (const [key, value] of Object.entries(source)) {
    if (isMetaKey(key) || !allowedFields.has(key)) {
      continue;
    }
    target[key] = sanitizeValue(value);
  }
}

export function lineItemFieldsOnly(
  type: TradeDocumentType,
  row: DocumentRow
): DocumentRow {
  const next = emptyRowFrom(type.lineItemColumns);
  assignKnownFields(next, row, fieldSet(type.lineItemColumns));
  const rowId = row[ROW_ID_FIELD];
  if (rowId != null && rowId !== "") {
    next[ROW_ID_FIELD] = rowId;
  }
  return next;
}

export function applyHeaderFieldsToLineItems(
  type: TradeDocumentType,
  header: DocumentRow,
  lineItems: DocumentRow[],
  includedHeaderFields: string[]
): DocumentRow[] {
  const allowed = fieldSet(type.headerColumns);
  const fields = includedHeaderFields.filter((field) => allowed.has(field));

  return lineItems.map((item) => {
    const row = lineItemFieldsOnly(type, item);
    for (const field of fields) {
      row[field] = header[field] ?? "";
    }
    return row;
  });
}

export function columnsForLineItems(
  type: TradeDocumentType,
  includedHeaderFields: string[]
): DocumentColumn[] {
  const included = new Set(includedHeaderFields);
  return [
    ...type.headerColumns.filter((column) => included.has(column.field)),
    ...type.lineItemColumns,
  ];
}

export function parseExtractedDocument(
  type: TradeDocumentType,
  extracted: unknown
): {
  header: DocumentRow;
  lineItems: DocumentRow[];
} {
  const source =
    extracted && typeof extracted === "object"
      ? (extracted as Record<string, unknown>)
      : {};

  const header = emptyRowFrom(type.headerColumns);
  assignKnownFields(header, source, fieldSet(type.headerColumns));

  const rawLineItems = source.line_items;
  const items = Array.isArray(rawLineItems) ? rawLineItems : [];

  const lineItems = items.map((item) => {
    const row = emptyRowFrom(type.lineItemColumns);
    if (item && typeof item === "object") {
      assignKnownFields(
        row,
        item as Record<string, unknown>,
        fieldSet(type.lineItemColumns)
      );
    }
    return row;
  });

  return { header, lineItems };
}

export function defaultColumnNames(
  columns: DocumentColumn[]
): Record<string, string> {
  return Object.fromEntries(
    columns.map((column) => [column.field, column.headerName])
  );
}

export function resolveColumnNames(
  columns: DocumentColumn[],
  overrides: Record<string, string>
): Record<string, string> {
  const names = defaultColumnNames(columns);
  for (const column of columns) {
    const override = overrides[column.field];
    if (typeof override === "string" && override.trim()) {
      names[column.field] = override.trim();
    }
  }
  return names;
}

export function duplicateExportNames(
  columns: DocumentColumn[],
  names: Record<string, string>
): string[] {
  const seen = new Map<string, number>();
  for (const column of columns) {
    const name = (names[column.field] ?? column.headerName).trim().toLowerCase();
    seen.set(name, (seen.get(name) ?? 0) + 1);
  }
  return [...seen.entries()]
    .filter(([, count]) => count > 1)
    .map(([name]) => name);
}

/** @deprecated Use DocumentCellValue */
export type InvoiceCellValue = DocumentCellValue;
/** @deprecated Use DocumentRow */
export type CommercialInvoiceRow = DocumentRow;
/** @deprecated Use DocumentColumn */
export type InvoiceColumn = DocumentColumn;
