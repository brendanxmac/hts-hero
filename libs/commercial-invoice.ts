export {
  ROW_ID_FIELD,
  type DocumentCellValue as InvoiceCellValue,
  type DocumentColumn as InvoiceColumn,
  type DocumentRow as CommercialInvoiceRow,
} from "./trade-documents";
export { getTradeDocumentType } from "./trade-documents";

import { getTradeDocumentType } from "./trade-documents";

const invoice = getTradeDocumentType("commercial_invoice");

export const HEADER_COLUMNS = invoice.headerColumns;
export const LINE_ITEM_COLUMNS = invoice.lineItemColumns;
export const COMMERCIAL_INVOICE_SCHEMA = {
  type: "object" as const,
  properties: {
    ...Object.fromEntries(
      invoice.headerColumns.map((column) => [
        column.field,
        {
          type: column.valueType ?? "string",
          description: column.description,
        },
      ])
    ),
    line_items: {
      type: "array" as const,
      description: invoice.lineItemsDescription,
      items: {
        type: "object" as const,
        properties: Object.fromEntries(
          invoice.lineItemColumns.map((column) => [
            column.field,
            {
              type: column.valueType ?? "string",
              description: column.description,
            },
          ])
        ),
      },
    },
  },
};
