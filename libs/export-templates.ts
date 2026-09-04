import type { InvoiceTransformId } from "./invoice-transforms";
import {
  ROW_ID_FIELD,
  findHeaderColumn,
  findLineItemColumn,
  hasCellValue,
  type DocumentCellValue,
  type DocumentColumn,
  type DocumentRow,
  type TradeDocumentType,
  type TradeDocumentTypeId,
} from "./trade-documents";

export type ExportPresetId = "found" | "entry" | "forwarding";

export type ExportColumnSource =
  | { kind: "line"; field: string }
  | { kind: "header"; field: string }
  | { kind: "constant"; value: string }
  | { kind: "blank" };

export interface ExportColumn {
  id: string;
  source: ExportColumnSource;
  headerName: string;
  hidden?: boolean;
}

export interface ExportTemplate {
  id: string;
  name: string;
  documentTypeId: TradeDocumentTypeId;
  presetId?: ExportPresetId;
  dirty?: boolean;
  columns: ExportColumn[];
  transforms: InvoiceTransformId[];
}

export interface ExportTemplateStore {
  templates: ExportTemplate[];
  drafts: Partial<Record<TradeDocumentTypeId, ExportTemplate>>;
  lastTemplateIdByType: Partial<Record<TradeDocumentTypeId, string>>;
}

export const EXPORT_TEMPLATE_STORAGE_KEY = "hts-hero.doc-to-csv.templates.v1";

export const PRESET_FOUND_ID = "preset:found";
export const PRESET_ENTRY_ID = "preset:entry";
export const PRESET_FORWARDING_ID = "preset:forwarding";

const ENTRY_TRANSFORMS: InvoiceTransformId[] = [
  "htsSanitize",
  "htsPad10",
  "countryIso",
  "trimWhitespace",
  "stripCurrency",
];

const FORWARDING_TRANSFORMS: InvoiceTransformId[] = [
  "trimWhitespace",
  "normalizeUom",
];

export function lineColumnId(field: string): string {
  return `line:${field}`;
}

export function headerColumnId(field: string): string {
  return `header:${field}`;
}

export function newCustomColumnId(kind: "constant" | "blank"): string {
  const unique =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${kind}:${unique}`;
}

export function sourceFieldForColumn(column: ExportColumn): string {
  if (column.source.kind === "line" || column.source.kind === "header") {
    return column.source.field;
  }
  return column.id;
}

function lineColumn(
  type: TradeDocumentType,
  field: string
): ExportColumn | null {
  const column = findLineItemColumn(type, field);
  if (!column) {
    return null;
  }
  return {
    id: lineColumnId(field),
    source: { kind: "line", field },
    headerName: column.headerName,
  };
}

function headerColumn(
  type: TradeDocumentType,
  field: string
): ExportColumn | null {
  const column = findHeaderColumn(type, field);
  if (!column) {
    return null;
  }
  return {
    id: headerColumnId(field),
    source: { kind: "header", field },
    headerName: column.headerName,
  };
}

function columnsFromFields(
  type: TradeDocumentType,
  specs: { kind: "line" | "header"; field: string }[]
): ExportColumn[] {
  const columns: ExportColumn[] = [];
  for (const spec of specs) {
    const column =
      spec.kind === "line"
        ? lineColumn(type, spec.field)
        : headerColumn(type, spec.field);
    if (column) {
      columns.push(column);
    }
  }
  return columns;
}

export function populatedLineItemFields(
  type: TradeDocumentType,
  lineItems: DocumentRow[]
): DocumentColumn[] {
  return type.lineItemColumns.filter((column) =>
    lineItems.some((row) => hasCellValue(row[column.field]))
  );
}

export function templateFromFound(
  type: TradeDocumentType,
  lineItems: DocumentRow[]
): ExportTemplate {
  return {
    id: PRESET_FOUND_ID,
    name: "What we found",
    documentTypeId: type.id,
    presetId: "found",
    dirty: false,
    columns: populatedLineItemFields(type, lineItems).map((column) => ({
      id: lineColumnId(column.field),
      source: { kind: "line", field: column.field },
      headerName: column.headerName,
    })),
    transforms: [],
  };
}

export function templateFromEntry(type: TradeDocumentType): ExportTemplate {
  return {
    id: PRESET_ENTRY_ID,
    name: "US entry lines",
    documentTypeId: type.id,
    presetId: "entry",
    dirty: false,
    columns: columnsFromFields(type, [
      { kind: "header", field: "invoice_number" },
      { kind: "line", field: "line_number" },
      { kind: "line", field: "description" },
      { kind: "line", field: "hs_code" },
      { kind: "line", field: "country_of_origin" },
      { kind: "line", field: "quantity" },
      { kind: "line", field: "unit_of_measure" },
      { kind: "line", field: "unit_price" },
      { kind: "line", field: "line_amount" },
      { kind: "line", field: "net_weight" },
      { kind: "line", field: "manufacturer_id" },
      { kind: "line", field: "manufacturer_name" },
      { kind: "line", field: "packages_count" },
    ]),
    transforms: [...ENTRY_TRANSFORMS],
  };
}

export function templateFromForwarding(
  type: TradeDocumentType
): ExportTemplate {
  const byType: Record<
    TradeDocumentTypeId,
    { kind: "line" | "header"; field: string }[]
  > = {
    commercial_invoice: [
      { kind: "line", field: "sku" },
      { kind: "line", field: "description" },
      { kind: "line", field: "quantity" },
      { kind: "line", field: "unit_of_measure" },
      { kind: "line", field: "net_weight" },
      { kind: "line", field: "gross_weight" },
      { kind: "line", field: "packages_count" },
      { kind: "header", field: "total_packages" },
      { kind: "header", field: "weight_unit" },
    ],
    packing_list: [
      { kind: "line", field: "carton_number" },
      { kind: "line", field: "marks_and_numbers" },
      { kind: "line", field: "sku" },
      { kind: "line", field: "description" },
      { kind: "line", field: "quantity" },
      { kind: "line", field: "net_weight" },
      { kind: "line", field: "gross_weight" },
      { kind: "line", field: "volume" },
      { kind: "line", field: "dimensions" },
      { kind: "header", field: "total_packages" },
    ],
    bill_of_lading: [
      { kind: "header", field: "bl_number" },
      { kind: "line", field: "marks_and_numbers" },
      { kind: "line", field: "description" },
      { kind: "line", field: "container_number" },
      { kind: "line", field: "seal_number" },
      { kind: "line", field: "packages_count" },
      { kind: "line", field: "package_type" },
      { kind: "line", field: "gross_weight" },
      { kind: "line", field: "volume" },
    ],
  };

  return {
    id: PRESET_FORWARDING_ID,
    name: "Forwarding / warehouse",
    documentTypeId: type.id,
    presetId: "forwarding",
    dirty: false,
    columns: columnsFromFields(type, byType[type.id]),
    transforms: [...FORWARDING_TRANSFORMS],
  };
}

export function presetTemplate(
  type: TradeDocumentType,
  presetId: ExportPresetId,
  lineItems: DocumentRow[]
): ExportTemplate {
  if (presetId === "entry") {
    return templateFromEntry(type);
  }
  if (presetId === "forwarding") {
    return templateFromForwarding(type);
  }
  return templateFromFound(type, lineItems);
}

export function cloneTemplate(template: ExportTemplate): ExportTemplate {
  return {
    ...template,
    columns: template.columns.map((column) => ({
      ...column,
      source: { ...column.source },
    })),
    transforms: [...template.transforms],
  };
}

export function markTemplateDirty(template: ExportTemplate): ExportTemplate {
  return { ...cloneTemplate(template), dirty: true };
}

function storedValue(
  row: DocumentRow,
  column: ExportColumn
): DocumentCellValue | undefined {
  if (column.id in row) {
    return row[column.id];
  }
  if (column.source.kind === "line") {
    return row[column.source.field];
  }
  return undefined;
}

export function resolveColumnValue(
  column: ExportColumn,
  row: DocumentRow,
  header: DocumentRow,
  edited: boolean
): DocumentCellValue {
  if (edited) {
    return storedValue(row, column) ?? "";
  }
  switch (column.source.kind) {
    case "line":
      return row[column.source.field] ?? "";
    case "header":
      return header[column.source.field] ?? "";
    case "constant":
      return column.source.value;
    case "blank":
      return storedValue(row, column) ?? "";
  }
}

export function buildGridRows(
  header: DocumentRow,
  lineItems: DocumentRow[],
  columns: ExportColumn[],
  editedCells: Record<string, true>
): DocumentRow[] {
  return lineItems.map((item) => {
    const rowId = String(item[ROW_ID_FIELD] ?? "");
    const row: DocumentRow = { [ROW_ID_FIELD]: rowId };
    for (const column of columns) {
      row[column.id] = resolveColumnValue(
        column,
        item,
        header,
        Boolean(editedCells[`${rowId}:${column.id}`])
      );
    }
    return row;
  });
}

export function applyColumnEdit(
  lineItems: DocumentRow[],
  rowId: string,
  column: ExportColumn,
  value: DocumentCellValue
): DocumentRow[] {
  return lineItems.map((row) => {
    if (String(row[ROW_ID_FIELD]) !== rowId) {
      return row;
    }
    const next = { ...row, [column.id]: value };
    if (column.source.kind === "line") {
      next[column.source.field] = value;
    }
    return next;
  });
}

export function columnIsOnTemplate(
  template: ExportTemplate,
  source: ExportColumnSource
): boolean {
  return template.columns.some((column) => {
    if (column.source.kind !== source.kind) {
      return false;
    }
    if (source.kind === "line" || source.kind === "header") {
      return (
        (column.source.kind === "line" || column.source.kind === "header") &&
        column.source.field === source.field
      );
    }
    return false;
  });
}

export function addLineColumnToTemplate(
  type: TradeDocumentType,
  template: ExportTemplate,
  field: string
): ExportTemplate {
  const column = lineColumn(type, field);
  if (!column || columnIsOnTemplate(template, column.source)) {
    return template;
  }
  const next = markTemplateDirty(template);
  next.columns = [...next.columns, column];
  return next;
}

export function addConstantColumnToTemplate(
  template: ExportTemplate,
  headerName: string,
  value: string
): ExportTemplate {
  const name = headerName.trim();
  if (!name) {
    return template;
  }
  const next = markTemplateDirty(template);
  next.columns = [
    ...next.columns,
    {
      id: newCustomColumnId("constant"),
      source: { kind: "constant", value },
      headerName: name,
    },
  ];
  return next;
}

export function addBlankColumnToTemplate(
  template: ExportTemplate,
  headerName: string
): ExportTemplate {
  const name = headerName.trim();
  if (!name) {
    return template;
  }
  const next = markTemplateDirty(template);
  next.columns = [
    ...next.columns,
    {
      id: newCustomColumnId("blank"),
      source: { kind: "blank" },
      headerName: name,
    },
  ];
  return next;
}

export function addHeaderColumnToTemplate(
  type: TradeDocumentType,
  template: ExportTemplate,
  field: string
): ExportTemplate {
  const column = headerColumn(type, field);
  if (!column || columnIsOnTemplate(template, column.source)) {
    return template;
  }
  const next = markTemplateDirty(template);
  next.columns = [...next.columns, column];
  return next;
}

export function removeColumnFromTemplate(
  template: ExportTemplate,
  columnId: string
): ExportTemplate {
  const next = markTemplateDirty(template);
  next.columns = next.columns.filter((column) => column.id !== columnId);
  return next;
}

export function toggleColumnHidden(
  template: ExportTemplate,
  columnId: string
): ExportTemplate {
  const next = markTemplateDirty(template);
  next.columns = next.columns.map((column) =>
    column.id === columnId ? { ...column, hidden: !column.hidden } : column
  );
  return next;
}

export function renameTemplateColumn(
  template: ExportTemplate,
  columnId: string,
  headerName: string
): ExportTemplate {
  const next = markTemplateDirty(template);
  next.columns = next.columns.map((column) =>
    column.id === columnId ? { ...column, headerName } : column
  );
  return next;
}

export function reorderTemplateColumns(
  template: ExportTemplate,
  orderedIds: string[]
): ExportTemplate {
  const byId = new Map(template.columns.map((column) => [column.id, column]));
  const nextColumns: ExportColumn[] = [];
  for (const id of orderedIds) {
    const column = byId.get(id);
    if (column) {
      nextColumns.push(column);
      byId.delete(id);
    }
  }
  for (const column of template.columns) {
    if (byId.has(column.id)) {
      nextColumns.push(column);
    }
  }
  const unchanged =
    nextColumns.length === template.columns.length &&
    nextColumns.every((column, index) => column.id === template.columns[index]?.id);
  if (unchanged) {
    return template;
  }
  const next = markTemplateDirty(template);
  next.columns = nextColumns;
  return next;
}

export function moveTemplateColumn(
  template: ExportTemplate,
  columnId: string,
  direction: -1 | 1
): ExportTemplate {
  const index = template.columns.findIndex((column) => column.id === columnId);
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= template.columns.length) {
    return template;
  }
  const ids = template.columns.map((column) => column.id);
  const [removed] = ids.splice(index, 1);
  ids.splice(nextIndex, 0, removed);
  return reorderTemplateColumns(template, ids);
}

export function duplicateExportNames(columns: ExportColumn[]): string[] {
  const seen = new Map<string, number>();
  for (const column of columns) {
    if (column.hidden) {
      continue;
    }
    const name = column.headerName.trim().toLowerCase();
    if (!name) {
      continue;
    }
    seen.set(name, (seen.get(name) ?? 0) + 1);
  }
  return Array.from(seen.entries())
    .filter(([, count]) => count > 1)
    .map(([name]) => name);
}

export function unusedLineColumns(
  type: TradeDocumentType,
  template: ExportTemplate
): DocumentColumn[] {
  return type.lineItemColumns.filter(
    (column) => !columnIsOnTemplate(template, { kind: "line", field: column.field })
  );
}

export function unusedHeaderColumns(
  type: TradeDocumentType,
  template: ExportTemplate
): DocumentColumn[] {
  return type.headerColumns.filter(
    (column) =>
      !columnIsOnTemplate(template, { kind: "header", field: column.field })
  );
}

export function nextRowId(rows: DocumentRow[]): string {
  let max = 0;
  for (const row of rows) {
    const parsed = Number(row[ROW_ID_FIELD]);
    if (Number.isFinite(parsed)) {
      max = Math.max(max, parsed);
    }
  }
  return String(max + 1);
}

export function emptyLineItem(
  type: TradeDocumentType,
  rowId: string
): DocumentRow {
  const row: DocumentRow = { [ROW_ID_FIELD]: rowId };
  for (const column of type.lineItemColumns) {
    row[column.field] = "";
  }
  return row;
}

export function emptyStore(): ExportTemplateStore {
  return {
    templates: [],
    drafts: {},
    lastTemplateIdByType: {},
  };
}

export function isPresetId(
  value: string
): value is typeof PRESET_FOUND_ID | typeof PRESET_ENTRY_ID | typeof PRESET_FORWARDING_ID {
  return (
    value === PRESET_FOUND_ID ||
    value === PRESET_ENTRY_ID ||
    value === PRESET_FORWARDING_ID
  );
}

function isExportColumn(value: unknown): value is ExportColumn {
  if (!value || typeof value !== "object") {
    return false;
  }
  const column = value as ExportColumn;
  return (
    typeof column.id === "string" &&
    typeof column.headerName === "string" &&
    Boolean(column.source) &&
    typeof column.source === "object"
  );
}

function isExportTemplate(value: unknown): value is ExportTemplate {
  if (!value || typeof value !== "object") {
    return false;
  }
  const template = value as ExportTemplate;
  return (
    typeof template.id === "string" &&
    typeof template.name === "string" &&
    (template.documentTypeId === "commercial_invoice" ||
      template.documentTypeId === "packing_list" ||
      template.documentTypeId === "bill_of_lading") &&
    Array.isArray(template.columns) &&
    template.columns.every(isExportColumn) &&
    Array.isArray(template.transforms)
  );
}

export function parseExportTemplateStore(raw: unknown): ExportTemplateStore {
  const store = emptyStore();
  if (!raw || typeof raw !== "object") {
    return store;
  }
  const record = raw as Partial<ExportTemplateStore>;
  if (Array.isArray(record.templates)) {
    store.templates = record.templates.filter(isExportTemplate);
  }
  if (record.drafts && typeof record.drafts === "object") {
    for (const id of [
      "commercial_invoice",
      "packing_list",
      "bill_of_lading",
    ] as const) {
      const draft = record.drafts[id];
      if (isExportTemplate(draft)) {
        store.drafts[id] = draft;
      }
    }
  }
  if (record.lastTemplateIdByType && typeof record.lastTemplateIdByType === "object") {
    store.lastTemplateIdByType = { ...record.lastTemplateIdByType };
  }
  return store;
}

export function loadExportTemplateStore(): ExportTemplateStore {
  if (typeof window === "undefined") {
    return emptyStore();
  }
  try {
    const raw = window.localStorage.getItem(EXPORT_TEMPLATE_STORAGE_KEY);
    if (!raw) {
      return emptyStore();
    }
    return parseExportTemplateStore(JSON.parse(raw));
  } catch {
    return emptyStore();
  }
}

export function saveExportTemplateStore(store: ExportTemplateStore): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(
      EXPORT_TEMPLATE_STORAGE_KEY,
      JSON.stringify(store)
    );
  } catch {
    // Ignore quota / private-mode failures.
  }
}

export function resolveTemplateForExtract(
  type: TradeDocumentType,
  lineItems: DocumentRow[],
  store: ExportTemplateStore
): ExportTemplate {
  const lastId = store.lastTemplateIdByType[type.id];
  const draft = store.drafts[type.id];

  if (!lastId || lastId === PRESET_FOUND_ID) {
    if (draft?.presetId === "found" && draft.dirty) {
      return cloneTemplate(draft);
    }
    return templateFromFound(type, lineItems);
  }

  if (lastId === PRESET_ENTRY_ID) {
    if (draft?.presetId === "entry" && draft.dirty) {
      return cloneTemplate(draft);
    }
    return templateFromEntry(type);
  }

  if (lastId === PRESET_FORWARDING_ID) {
    if (draft?.presetId === "forwarding" && draft.dirty) {
      return cloneTemplate(draft);
    }
    return templateFromForwarding(type);
  }

  const saved = store.templates.find(
    (template) => template.id === lastId && template.documentTypeId === type.id
  );
  if (saved) {
    return cloneTemplate(saved);
  }
  if (draft && draft.documentTypeId === type.id) {
    return cloneTemplate(draft);
  }
  return templateFromFound(type, lineItems);
}

export function persistWorkingTemplate(
  store: ExportTemplateStore,
  template: ExportTemplate
): ExportTemplateStore {
  return {
    templates: store.templates,
    drafts: {
      ...store.drafts,
      [template.documentTypeId]: cloneTemplate(template),
    },
    lastTemplateIdByType: {
      ...store.lastTemplateIdByType,
      [template.documentTypeId]: template.id,
    },
  };
}

function newTemplateId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `tmpl-${Date.now()}`;
}

export function saveNamedTemplate(
  store: ExportTemplateStore,
  template: ExportTemplate,
  name: string
): { store: ExportTemplateStore; template: ExportTemplate } {
  const trimmed = name.trim() || "Untitled template";
  const canUpdate =
    !isPresetId(template.id) &&
    store.templates.some((current) => current.id === template.id);
  const saved: ExportTemplate = {
    ...cloneTemplate(template),
    id: canUpdate ? template.id : newTemplateId(),
    name: trimmed,
    presetId: undefined,
    dirty: false,
  };

  const templates = [...store.templates];
  const existingIndex = templates.findIndex((current) => current.id === saved.id);
  if (existingIndex >= 0) {
    templates[existingIndex] = saved;
  } else {
    templates.push(saved);
  }

  const nextStore: ExportTemplateStore = {
    templates,
    drafts: {
      ...store.drafts,
      [saved.documentTypeId]: saved,
    },
    lastTemplateIdByType: {
      ...store.lastTemplateIdByType,
      [saved.documentTypeId]: saved.id,
    },
  };
  return { store: nextStore, template: saved };
}

export function saveAsNamedTemplate(
  store: ExportTemplateStore,
  template: ExportTemplate,
  name: string
): { store: ExportTemplateStore; template: ExportTemplate } {
  return saveNamedTemplate(
    store,
    { ...template, id: PRESET_FOUND_ID },
    name
  );
}
