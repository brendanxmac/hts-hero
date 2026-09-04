"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
  type RefObject,
  type SVGProps,
} from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import toast from "react-hot-toast";
import {
  AdjustmentsHorizontalIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClipboardDocumentIcon,
  CubeIcon,
  DocumentArrowUpIcon,
  DocumentIcon,
  DocumentTextIcon,
  EyeSlashIcon,
  InformationCircleIcon,
  PlusIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TrashIcon,
  TruckIcon,
  BoltIcon,
  ViewColumnsIcon,
} from "@heroicons/react/24/outline";
import type {
  CellKeyDownEvent,
  CellValueChangedEvent,
  ColDef,
  ColumnMovedEvent,
  SelectionChangedEvent,
} from "ag-grid-community";
import { AllCommunityModule, themeQuartz } from "ag-grid-community";
import {
  AgGridProvider,
  AgGridReact,
  type CustomInnerHeaderProps,
} from "ag-grid-react";
import {
  HEADER_FIELD_GROUP_LABELS,
  ROW_ID_FIELD,
  TRADE_DOCUMENT_TYPES,
  getTradeDocumentType,
  groupedHeaderColumns,
  hasCellValue,
  headerHasValues,
  type DocumentCellValue,
  type DocumentRow,
  type TradeDocumentType,
  type TradeDocumentTypeId,
} from "../libs/trade-documents";
import {
  applyInvoiceTransforms,
  editedCellKey,
  INVOICE_TRANSFORMS,
  toggleInvoiceTransform,
  type InvoiceTransformId,
} from "../libs/invoice-transforms";
import {
  PRESET_ENTRY_ID,
  PRESET_FORWARDING_ID,
  PRESET_FOUND_ID,
  addBlankColumnToTemplate,
  addConstantColumnToTemplate,
  addHeaderColumnToTemplate,
  addLineColumnToTemplate,
  applyColumnEdit,
  buildGridRows,
  columnIsOnTemplate,
  duplicateExportNames,
  emptyLineItem,
  emptyStore,
  isPresetId,
  loadExportTemplateStore,
  markTemplateDirty,
  moveTemplateColumn,
  nextRowId,
  persistWorkingTemplate,
  presetTemplate,
  removeColumnFromTemplate,
  renameTemplateColumn,
  reorderTemplateColumns,
  resolveTemplateForExtract,
  saveAsNamedTemplate,
  saveExportTemplateStore,
  saveNamedTemplate,
  sourceFieldForColumn,
  toggleColumnHidden,
  unusedHeaderColumns,
  unusedLineColumns,
  type ExportPresetId,
  type ExportTemplate,
  type ExportTemplateStore,
} from "../libs/export-templates";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/solid";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const EXTRACT_POLL_MS = 5_000;
const EXTRACT_MAX_WAIT_MS = 5 * 60 * 1000;
const GRID_MODULES = [AllCommunityModule];
const RESULTS_VIEWPORT_CLASS =
  "h-[calc(100dvh-4rem)] max-h-[calc(100dvh-4rem)] min-h-0";

const GRID_THEME_SHARED = {
  fontFamily: "inherit",
  fontSize: 13,
  headerFontSize: 12,
  headerFontWeight: 600,
  spacing: 8,
  wrapperBorder: false,
  wrapperBorderRadius: 0,
  columnBorder: true,
  rowBorder: true,
  headerRowBorder: true,
  cellHorizontalPadding: 14,
} as const;

const GRID_THEME = themeQuartz
  .withParams(GRID_THEME_SHARED)
  .withParams(
    {
      browserColorScheme: "light",
      backgroundColor: "#ffffff",
      foregroundColor: "#111827",
      textColor: "#111827",
      headerBackgroundColor: "#f1f5f9",
      headerTextColor: "#0f172a",
      borderColor: "#cbd5e1",
      oddRowBackgroundColor: "#f8fafc",
      rowHoverColor: "rgba(87, 13, 248, 0.08)",
      selectedRowBackgroundColor: "rgba(87, 13, 248, 0.14)",
      accentColor: "#570df8",
      chromeBackgroundColor: "#f1f5f9",
      rangeSelectionBackgroundColor: "rgba(87, 13, 248, 0.12)",
      rangeSelectionBorderColor: "#570df8",
      headerColumnResizeHandleColor: "#94a3b8",
      cellEditingBorder: { color: "#570df8", width: 2 },
      iconColor: "#334155",
    },
    "light"
  )
  .withParams(
    {
      browserColorScheme: "dark",
      backgroundColor: "#1d232a",
      foregroundColor: "#f3f4f6",
      textColor: "#f3f4f6",
      headerBackgroundColor: "#15191e",
      headerTextColor: "#f8fafc",
      borderColor: "rgba(255, 255, 255, 0.14)",
      oddRowBackgroundColor: "#191e24",
      rowHoverColor: "rgba(167, 139, 250, 0.16)",
      selectedRowBackgroundColor: "rgba(167, 139, 250, 0.22)",
      accentColor: "#a78bfa",
      chromeBackgroundColor: "#15191e",
      rangeSelectionBackgroundColor: "rgba(167, 139, 250, 0.18)",
      rangeSelectionBorderColor: "#a78bfa",
      headerColumnResizeHandleColor: "#64748b",
      cellEditingBorder: { color: "#a78bfa", width: 2 },
      iconColor: "#e2e8f0",
    },
    "dark"
  );

function csvFileNameFromUpload(
  fileName: string | undefined,
  fallback: string
): string {
  if (!fileName) {
    return fallback;
  }
  const stem = fileName.replace(/\.[^.]+$/, "").trim();
  return stem ? `${stem}.csv` : fallback;
}

const DOCUMENT_TYPE_ICONS: Record<
  TradeDocumentTypeId,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  commercial_invoice: DocumentTextIcon,
  packing_list: CubeIcon,
  bill_of_lading: TruckIcon,
};

function HideColumnInnerHeader(props: CustomInnerHeaderProps<DocumentRow>) {
  const hideColumn = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const field = props.column.getColDef().field;
    if (field) {
      (
        props.context as { onHideColumn?: (field: string) => void } | undefined
      )?.onHideColumn?.(field);
      return;
    }
    props.api.setColumnsVisible([props.column], false);
  };

  return (
    <span className="flex items-center gap-1 min-w-0">
      <span className="truncate">{props.displayName}</span>
      <button
        type="button"
        className="shrink-0 rounded p-0.5 text-base-content/40 hover:bg-base-content/10 hover:text-base-content"
        title="Hide column — excluded from CSV"
        aria-label={`Hide ${props.displayName} column`}
        onClick={hideColumn}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <EyeSlashIcon className="w-3.5 h-3.5" />
      </button>
    </span>
  );
}

const defaultColDef: ColDef = {
  editable: true,
  sortable: true,
  filter: false,
  resizable: true,
  headerComponentParams: {
    innerHeaderComponent: HideColumnInnerHeader,
  },
};

function copyCellOnKeyDown(event: CellKeyDownEvent<DocumentRow>) {
  const keyboardEvent = event.event;
  if (!(keyboardEvent instanceof KeyboardEvent)) {
    return;
  }
  const isCopy =
    (keyboardEvent.metaKey || keyboardEvent.ctrlKey) &&
    keyboardEvent.key.toLowerCase() === "c" &&
    !keyboardEvent.altKey &&
    !keyboardEvent.shiftKey;
  if (!isCopy) {
    return;
  }
  if (event.api.getEditingCells().length > 0) {
    return;
  }
  const value = event.value;
  if (value == null || value === "") {
    return;
  }
  void navigator.clipboard.writeText(String(value));
  keyboardEvent.preventDefault();
  keyboardEvent.stopPropagation();
}

interface LineItemsGridProps {
  gridRef: RefObject<AgGridReact<DocumentRow> | null>;
  rowData: DocumentRow[];
  columns: ExportTemplate["columns"];
  csvFileName: string;
  onHideColumn: (field: string) => void;
  onColumnMoved: (orderedIds: string[]) => void;
  onSelectionChanged: (count: number) => void;
  onSourceCellChange: (
    rowId: string,
    field: string,
    value: DocumentCellValue
  ) => void;
}

function LineItemsGrid({
  gridRef,
  rowData,
  columns,
  csvFileName,
  onHideColumn,
  onColumnMoved,
  onSelectionChanged,
  onSourceCellChange,
}: LineItemsGridProps) {
  const columnsRef = useRef(columns);
  columnsRef.current = columns;

  const columnDefs = useMemo(
    () =>
      columns.map((column) => ({
        field: column.id,
        headerName: column.headerName,
        headerValueGetter: () =>
          columnsRef.current.find((item) => item.id === column.id)?.headerName ??
          column.headerName,
        minWidth:
          sourceFieldForColumn(column) === "description" ||
            sourceFieldForColumn(column).includes("address")
            ? 240
            : 150,
        hide: Boolean(column.hidden),
      })),
    [columns]
  );

  useEffect(() => {
    gridRef.current?.api?.refreshHeader();
  }, [columns, gridRef]);

  const onCellValueChanged = (event: CellValueChangedEvent<DocumentRow>) => {
    const field = event.colDef.field;
    const rowId = event.data?.[ROW_ID_FIELD];
    if (!field || field === ROW_ID_FIELD || rowId == null || rowId === "") {
      return;
    }
    onSourceCellChange(String(rowId), field, event.newValue ?? "");
  };

  const handleColumnMoved = (event: ColumnMovedEvent<DocumentRow>) => {
    if (!event.finished) {
      return;
    }
    const ids = event.api
      .getColumnState()
      .map((state) => state.colId)
      .filter((id): id is string => Boolean(id) && id !== ROW_ID_FIELD);
    onColumnMoved(ids);
  };

  const handleSelectionChanged = (
    event: SelectionChangedEvent<DocumentRow>
  ) => {
    onSelectionChanged(event.api.getSelectedRows().length);
  };

  return (
    <div className="w-full h-full min-h-0" style={{ height: "100%" }}>
      <AgGridReact<DocumentRow>
        ref={gridRef}
        theme={GRID_THEME}
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        getRowId={(params) => String(params.data?.[ROW_ID_FIELD] ?? "")}
        context={{ onHideColumn }}
        domLayout="normal"
        undoRedoCellEditing
        undoRedoCellEditingLimit={50}
        stopEditingWhenCellsLoseFocus={false}
        enableCellTextSelection
        ensureDomOrder
        animateRows={false}
        rowSelection={{
          mode: "multiRow",
          checkboxes: true,
          headerCheckbox: true,
          enableClickSelection: false,
        }}
        defaultCsvExportParams={{
          allColumns: false,
          fileName: csvFileName,
          processHeaderCallback: (params) => {
            const field = params.column.getColDef().field;
            if (!field) {
              return params.column.getColDef().headerName ?? "";
            }
            return (
              columnsRef.current.find((column) => column.id === field)
                ?.headerName ??
              params.column.getColDef().headerName ??
              field
            );
          },
        }}
        onCellKeyDown={copyCellOnKeyDown}
        onCellValueChanged={onCellValueChanged}
        onColumnMoved={handleColumnMoved}
        onSelectionChanged={handleSelectionChanged}
      />
    </div>
  );
}

function DocumentTypePicker({
  selected,
  disabled,
  onSelect,
}: {
  selected: TradeDocumentTypeId;
  disabled: boolean;
  onSelect: (id: TradeDocumentTypeId) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 gap-3">
      {TRADE_DOCUMENT_TYPES.map((type) => {
        const Icon = DOCUMENT_TYPE_ICONS[type.id];
        const isSelected = selected === type.id;
        return (
          <button
            key={type.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(type.id)}
            className={`text-left rounded-2xl border-2 px-4 py-5 flex gap-3 items-center transition bg-base-100 ${isSelected
              ? "border-primary bg-primary/10 ring-2 ring-primary/25"
              : "border-base-content/10 hover:border-base-content/30"
              } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <Icon
              className={`w-7 h-7 ${isSelected ? "text-primary" : "text-base-content/45"}`}
            />
            <span className="text-sm font-semibold text-base-content">
              {type.label}
            </span>
            {/* <span className="text-xs text-base-content/60 leading-relaxed">
              {type.description}
            </span> */}
          </button>
        );
      })}
    </div>
  );
}

type WorkspaceTab = "pdf" | "details" | "normalize" | "names";

function TabIntro({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex flex-col gap-1 min-w-0">
        <h3 className="text-lg font-bold text-base-content tracking-tight">
          {title}
        </h3>
        <p className="text-sm text-base-content/75 leading-relaxed">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}

function NormalizeRules({
  enabled,
  onToggle,
  onReset,
}: {
  enabled: InvoiceTransformId[];
  onToggle: (id: InvoiceTransformId) => void;
  onReset: () => void;
}) {
  const enabledSet = new Set(enabled);

  return (
    <div className="flex flex-col gap-4">
      <TabIntro
        title="Format Extracted Data"
        description="Toggle a rule to update values in the table. Turn it off to restore the extracted value. Cells you have edited are left as-is."
        action={
          enabled.length > 0 ? (
            <button
              type="button"
              className="btn btn-ghost btn-sm shrink-0"
              onClick={onReset}
            >
              Reset
            </button>
          ) : undefined
        }
      />
      <div className="flex flex-col gap-2.5">
        {INVOICE_TRANSFORMS.map((rule) => {
          const isOn = enabledSet.has(rule.id);
          return (
            <label
              key={rule.id}
              className={`flex items-center justify-between gap-4 rounded-xl px-4 py-3.5 cursor-pointer transition-colors ${isOn
                ? "bg-primary/15 ring-2 ring-primary/35"
                : "bg-base-200 hover:bg-base-300/70"
                }`}
            >
              <span className="min-w-0 flex flex-col gap-1">
                <span className="text-sm font-semibold text-base-content break-words">
                  {rule.label}
                </span>
                <span className="text-sm text-base-content/65 break-words">
                  {rule.example}
                </span>
              </span>
              <input
                type="checkbox"
                className="toggle toggle-primary shrink-0"
                checked={isOn}
                onChange={() => onToggle(rule.id)}
                aria-label={rule.label}
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}

function columnSourceLabel(column: ExportTemplate["columns"][number]): string {
  switch (column.source.kind) {
    case "line":
      return "Line";
    case "header":
      return "Document";
    case "constant":
      return "Constant";
    case "blank":
      return "Custom";
  }
}

function ColumnMapper({
  documentType,
  template,
  onChange,
}: {
  documentType: TradeDocumentType;
  template: ExportTemplate;
  onChange: (template: ExportTemplate) => void;
}) {
  const [constantName, setConstantName] = useState("");
  const [constantValue, setConstantValue] = useState("");
  const [blankName, setBlankName] = useState("");
  const hiddenCount = template.columns.filter((column) => column.hidden).length;
  const duplicates = duplicateExportNames(template.columns);
  const unusedLine = unusedLineColumns(documentType, template);
  const unusedHeader = unusedHeaderColumns(documentType, template);

  return (
    <div className="flex flex-col gap-4">
      <TabIntro
        title="Manage Columns"
        description="This is the file you will download. Reorder, rename, hide, or add columns to match your import map."
        action={
          hiddenCount > 0 ? (
            <button
              type="button"
              className="btn btn-ghost btn-sm shrink-0"
              onClick={() =>
                onChange({
                  ...markTemplateDirty(template),
                  columns: template.columns.map((column) => ({
                    ...column,
                    hidden: false,
                  })),
                })
              }
            >
              Show all
            </button>
          ) : undefined
        }
      />
      <div className="flex flex-col gap-2.5">
        {template.columns.map((column, index) => {
          const hidden = Boolean(column.hidden);
          return (
            <div
              key={column.id}
              className={`flex items-center gap-2 rounded-xl px-3 py-3 transition-colors ${hidden
                ? "bg-base-200/70 opacity-70"
                : "bg-base-200 hover:bg-base-300/70"
                }`}
            >
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  type="button"
                  className="btn btn-ghost btn-xs px-1 min-h-0 h-6"
                  disabled={index === 0}
                  aria-label={`Move ${column.headerName} up`}
                  onClick={() =>
                    onChange(moveTemplateColumn(template, column.id, -1))
                  }
                >
                  <ChevronUpIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs px-1 min-h-0 h-6"
                  disabled={index === template.columns.length - 1}
                  aria-label={`Move ${column.headerName} down`}
                  onClick={() =>
                    onChange(moveTemplateColumn(template, column.id, 1))
                  }
                >
                  <ChevronDownIcon className="w-4 h-4" />
                </button>
              </div>
              <label className="min-w-0 flex-1 flex flex-col gap-1.5 cursor-text">
                <span className="text-sm font-medium text-base-content/70 break-words">
                  {columnSourceLabel(column)}
                  {hidden ? " · hidden" : ""}
                </span>
                <input
                  type="text"
                  className="input input-bordered input-sm w-full min-w-0 font-semibold disabled:opacity-50"
                  value={column.headerName}
                  disabled={hidden}
                  placeholder="Column name"
                  onChange={(event) =>
                    onChange(
                      renameTemplateColumn(
                        template,
                        column.id,
                        event.target.value
                      )
                    )
                  }
                  onFocus={(event) => event.target.select()}
                  aria-label={`Export name for ${column.headerName}`}
                />
              </label>
              <input
                type="checkbox"
                className="toggle toggle-primary shrink-0"
                checked={!hidden}
                onChange={() =>
                  onChange(toggleColumnHidden(template, column.id))
                }
                aria-label={
                  hidden
                    ? `Show ${column.headerName} in CSV`
                    : `Hide ${column.headerName} from CSV`
                }
              />
              <button
                type="button"
                className="btn btn-ghost btn-xs px-1 text-base-content/50 hover:text-error"
                aria-label={`Remove ${column.headerName}`}
                onClick={() =>
                  onChange(removeColumnFromTemplate(template, column.id))
                }
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
      {duplicates.length > 0 && (
        <p className="text-sm text-warning font-medium">
          Some export names are duplicated. Most import templates need unique
          column headers.
        </p>
      )}
      <div className="flex flex-col gap-3 pt-1 border-t border-base-content/10">
        <p className="text-sm font-semibold text-base-content">Add a column</p>
        {unusedLine.length > 0 || unusedHeader.length > 0 ? (
          <select
            className="select select-bordered select-sm w-full"
            defaultValue=""
            onChange={(event) => {
              const value = event.target.value;
              event.target.value = "";
              if (!value) {
                return;
              }
              const [kind, ...fieldParts] = value.split(":");
              const field = fieldParts.join(":");
              onChange(
                kind === "line"
                  ? addLineColumnToTemplate(documentType, template, field)
                  : addHeaderColumnToTemplate(documentType, template, field)
              );
            }}
            aria-label="Add extracted field"
          >
            <option value="" disabled>
              Extracted field…
            </option>
            {unusedLine.length > 0 ? (
              <optgroup label="Line items">
                {unusedLine.map((column) => (
                  <option key={column.field} value={`line:${column.field}`}>
                    {column.headerName}
                  </option>
                ))}
              </optgroup>
            ) : null}
            {unusedHeader.length > 0 ? (
              <optgroup label="Document details">
                {unusedHeader.map((column) => (
                  <option key={column.field} value={`header:${column.field}`}>
                    {column.headerName}
                  </option>
                ))}
              </optgroup>
            ) : null}
          </select>
        ) : null}
        <form
          className="flex flex-col gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            onChange(
              addConstantColumnToTemplate(template, constantName, constantValue)
            );
            setConstantName("");
            setConstantValue("");
          }}
        >
          <input
            type="text"
            className="input input-bordered input-sm w-full"
            placeholder="Constant column name"
            value={constantName}
            onChange={(event) => setConstantName(event.target.value)}
          />
          <div className="flex gap-2">
            <input
              type="text"
              className="input input-bordered input-sm w-full"
              placeholder="Value on every row"
              value={constantValue}
              onChange={(event) => setConstantValue(event.target.value)}
            />
            <button type="submit" className="btn btn-sm btn-primary shrink-0">
              Add
            </button>
          </div>
        </form>
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            onChange(addBlankColumnToTemplate(template, blankName));
            setBlankName("");
          }}
        >
          <input
            type="text"
            className="input input-bordered input-sm w-full"
            placeholder="Blank column name"
            value={blankName}
            onChange={(event) => setBlankName(event.target.value)}
          />
          <button type="submit" className="btn btn-sm shrink-0">
            Add
          </button>
        </form>
      </div>
    </div>
  );
}

function DocumentDetailsPanel({
  documentType,
  header,
  template,
  showEmpty,
  copiedField,
  onShowEmpty,
  onCopy,
  onChangeHeader,
  onToggleField,
}: {
  documentType: TradeDocumentType;
  header: DocumentRow;
  template: ExportTemplate;
  showEmpty: boolean;
  copiedField: string | null;
  onShowEmpty: (show: boolean) => void;
  onCopy: (field: string, label: string) => void;
  onChangeHeader: (field: string, value: string) => void;
  onToggleField: (field: string) => void;
}) {
  const groups = groupedHeaderColumns(documentType.headerColumns)
    .map((entry) => ({
      ...entry,
      columns: showEmpty
        ? entry.columns
        : entry.columns.filter((column) => hasCellValue(header[column.field])),
    }))
    .filter((entry) => entry.columns.length > 0);

  return (
    <div className="flex flex-col gap-4">
      <TabIntro
        title="Document details"
        description="Values from outside the table. Edit them here, then add any of them as a column on every row."
        action={
          <label className="flex items-center gap-2 text-xs font-medium text-base-content/70 shrink-0">
            <input
              type="checkbox"
              className="checkbox checkbox-xs"
              checked={showEmpty}
              onChange={(event) => onShowEmpty(event.target.checked)}
            />
            Show empty
          </label>
        }
      />
      {groups.length === 0 ? (
        <p className="text-sm text-base-content/60">
          No document-level values were found. Turn on Show empty to fill them
          in yourself.
        </p>
      ) : (
        groups.map((entry) => (
          <section key={entry.group} className="flex flex-col gap-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wide text-base-content/50">
              {HEADER_FIELD_GROUP_LABELS[entry.group]}
            </h4>
            {entry.columns.map((column) => {
              const included = columnIsOnTemplate(template, {
                kind: "header",
                field: column.field,
              });
              const rawValue = header[column.field];
              const hasValue = hasCellValue(rawValue);
              const copied = copiedField === column.field;
              return (
                <div
                  key={column.field}
                  className={`flex items-start justify-between gap-3 rounded-xl px-4 py-3.5 transition-colors ${included
                    ? "bg-primary/15 ring-2 ring-primary/35"
                    : "bg-base-200"
                    }`}
                >
                  <div className="min-w-0 flex-1 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-base-content/70 break-words">
                        {column.headerName}
                      </span>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs px-1 min-h-0 h-7"
                        disabled={!hasValue}
                        onClick={() => onCopy(column.field, column.headerName)}
                        title={hasValue ? "Copy" : "No value to copy"}
                        aria-label={`Copy ${column.headerName}`}
                      >
                        {copied ? (
                          <CheckIcon className="w-4 h-4 text-success" />
                        ) : (
                          <ClipboardDocumentIcon className="w-4 h-4 text-base-content/45" />
                        )}
                      </button>
                    </div>
                    <input
                      type="text"
                      className="input input-bordered input-sm w-full min-w-0 font-semibold"
                      value={rawValue == null ? "" : String(rawValue)}
                      placeholder="—"
                      onChange={(event) =>
                        onChangeHeader(column.field, event.target.value)
                      }
                      aria-label={column.headerName}
                    />
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary shrink-0 mt-7"
                    checked={included}
                    onChange={() => onToggleField(column.field)}
                    aria-label={`Add ${column.headerName} to each row`}
                  />
                </div>
              );
            })}
          </section>
        ))
      )}
    </div>
  );
}

function InspectorRail({
  active,
  open,
  fieldCount,
  ruleCount,
  renamedCount,
  onSelect,
}: {
  active: WorkspaceTab;
  open: boolean;
  fieldCount: number;
  ruleCount: number;
  renamedCount: number;
  onSelect: (tab: WorkspaceTab) => void;
}) {
  const tabs: {
    id: WorkspaceTab;
    label: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    count?: number;
  }[] = [
      { id: "pdf", label: "Document", icon: DocumentIcon },
      {
        id: "details",
        label: "Details",
        icon: InformationCircleIcon,
        count: fieldCount,
      },
      {
        id: "names",
        label: "Manage Columns",
        icon: ViewColumnsIcon,
        count: renamedCount,
      },
      {
        id: "normalize",
        label: "Format Data",
        icon: AdjustmentsHorizontalIcon,
        count: ruleCount,
      }
    ];

  return (
    <nav className="shrink-0 flex md:flex-col bg-base-200 border-b md:border-b-0 md:border-r border-base-content/15 overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = open && active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelect(tab.id)}
            aria-pressed={isActive}
            className={`flex md:flex-col items-center justify-center gap-1.5 px-3 py-2.5 md:px-2 md:py-3 md:w-[4.75rem] text-[11px] font-semibold leading-tight text-center transition-colors ${isActive
              ? "text-primary-content bg-primary"
              : "text-base-content/70 hover:text-base-content hover:bg-base-300/80"
              }`}
          >
            <tab.icon className="w-5 h-5 shrink-0" />
            <span>{tab.label}</span>
            {tab.count ? (
              <span
                className={`text-[10px] leading-none px-1.5 py-0.5 rounded-full font-bold ${isActive
                  ? "bg-primary-content/20 text-primary-content"
                  : "bg-base-content/10 text-base-content"
                  }`}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}

const INTEGRATION_SYSTEMS = [
  {
    name: "CargoWise",
    src: "/integrations/cargowise.svg",
    heightClass: "h-5",
  },
  {
    name: "Magaya",
    src: "/integrations/magaya.png",
    heightClass: "h-5",
    invertOnDark: true,
  },
  {
    name: "Descartes",
    src: "/integrations/descartes.png",
    heightClass: "h-4",
    invertOnDark: true,
  },
  {
    name: "Excel",
    src: "/integrations/excel.svg",
    heightClass: "h-5",
    caption: "Any other system",
  },
] as const;

function IntegrationLogos() {
  return (
    <ul className="flex flex-wrap items-center gap-x-3 gap-y-2 pt-1">
      {INTEGRATION_SYSTEMS.map((system) => (
        <li key={system.name} className="flex items-center gap-1.5 opacity-55">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={system.src}
            alt={system.name}
            className={`${system.heightClass} w-auto max-w-[6.5rem] object-contain object-left ${"invertOnDark" in system && system.invertOnDark
              ? "dark:invert dark:brightness-0"
              : ""
              }`}
          />
          {"caption" in system && system.caption ? (
            <span className="text-[11px] font-medium text-base-content/55 whitespace-nowrap">
              {system.caption}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function SellingPoints() {
  return (
    <ul className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
      <li className="flex items-start gap-2.5 text-left">
        <ShieldCheckIcon className="w-6 h-6 shrink-0 mt-0.5 text-base-content/80" />
        <div className="flex flex-col gap-0.5">
          <p className="font-medium tracking-tight text-base-content/80">
            We never store your documents
          </p>
          <p className="text-sm text-base-content/60 leading-relaxed">
            PDFs are processed to extract data and are not saved. Your
            documents stay your business.
          </p>
        </div>
      </li>
      <li className="flex items-start gap-2.5 text-left">
        <SparklesIcon className="w-6 h-6 shrink-0 mt-0.5 text-base-content/80" />
        <div className="flex flex-col gap-0.5">
          <p className="font-medium tracking-tight text-base-content/80">
            Best in class accuracy
          </p>
          <p className="text-sm text-base-content/60 leading-relaxed">
            Built for invoices, packing lists, and bills of lading. Review
            every cell against the PDF before you export.
          </p>
        </div>
      </li>
      <li className="flex items-start gap-2.5 text-left">
        <BoltIcon className="w-6 h-6 shrink-0 mt-0.5 text-base-content/80" />
        <div className="flex flex-col gap-1.5 min-w-0">
          <p className="font-medium tracking-tight text-base-content/80">
            Ready for your import template
          </p>
          <IntegrationLogos />
        </div>
      </li>
    </ul>
  );
}

function SectionHeading({
  step,
  title,
  description,
  prominent = false,
}: {
  step: number;
  title: string;
  description?: string;
  prominent?: boolean;
}) {
  return (
    <div className="flex items-start gap-4">
      <span
        className={`flex shrink-0 items-center justify-center rounded-full bg-primary text-primary-content font-bold ${prominent ? "h-10 w-10 text-base" : "h-8 w-8 text-sm"
          }`}
      >
        {step}
      </span>
      <div className="flex flex-col gap-1 pt-0.5">
        <h2
          className={`font-bold text-base-content ${prominent
            ? "text-xl md:text-2xl"
            : "text-lg md:text-xl lg:text-2xl"
            }`}
        >
          {title}
        </h2>
        {description ? (
          <p className="text-sm text-base-content/60 leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function extractErrorHint(message: string): string | null {
  const lower = message.toLowerCase();
  if (lower.includes("timed out")) {
    return "This can take a few minutes. Try again, or use a smaller PDF.";
  }
  if (
    lower.includes("pdf") ||
    lower.includes("too large") ||
    lower.includes("10mb")
  ) {
    return null;
  }
  return "Wrong document type? Switch the type above and try again, or upload a different PDF.";
}

function TemplateBar({
  template,
  savedTemplates,
  saveOpen,
  saveName,
  onSaveName,
  onSelectId,
  onSave,
  onSaveAs,
  onToggleSaveAs,
}: {
  template: ExportTemplate;
  savedTemplates: ExportTemplate[];
  saveOpen: boolean;
  saveName: string;
  onSaveName: (name: string) => void;
  onSelectId: (id: string) => void;
  onSave: () => void;
  onSaveAs: () => void;
  onToggleSaveAs: () => void;
}) {
  const savedForType = savedTemplates.filter(
    (item) => item.documentTypeId === template.documentTypeId
  );
  return (
    <div className="flex flex-wrap items-center gap-2 min-w-0">
      <select
        className="select select-bordered select-sm max-w-[14rem]"
        value={template.id}
        onChange={(event) => onSelectId(event.target.value)}
        aria-label="Export template"
      >
        <optgroup label="Presets">
          <option value={PRESET_FOUND_ID}>What we found</option>
          <option value={PRESET_ENTRY_ID}>US entry lines</option>
          <option value={PRESET_FORWARDING_ID}>Forwarding / warehouse</option>
        </optgroup>
        {savedForType.length > 0 ? (
          <optgroup label="Saved">
            {savedForType.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </optgroup>
        ) : null}
        {!isPresetId(template.id) &&
          !savedForType.some((item) => item.id === template.id) ? (
          <option value={template.id}>{template.name}</option>
        ) : null}
      </select>
      {template.dirty ? (
        <span className="text-xs text-base-content/50 whitespace-nowrap">
          Unsaved
        </span>
      ) : null}
      {saveOpen ? (
        <form
          className="flex items-center gap-1.5"
          onSubmit={(event) => {
            event.preventDefault();
            onSaveAs();
          }}
        >
          <input
            type="text"
            className="input input-bordered input-sm w-36"
            placeholder="Template name"
            value={saveName}
            onChange={(event) => onSaveName(event.target.value)}
            autoFocus
          />
          <button type="submit" className="btn btn-sm btn-primary">
            Save
          </button>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={onToggleSaveAs}
          >
            Cancel
          </button>
        </form>
      ) : (
        <>
          {!isPresetId(template.id) ? (
            <button type="button" className="btn btn-sm" onClick={onSave}>
              Save
            </button>
          ) : null}
          <button type="button" className="btn btn-sm" onClick={onToggleSaveAs}>
            Save as
          </button>
        </>
      )}
    </div>
  );
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException
    ? error.name === "AbortError"
    : error instanceof Error && error.name === "AbortError";
}

function waitMs(ms: number, signal: AbortSignal): Promise<void> {
  if (signal.aborted) {
    return Promise.reject(new DOMException("Aborted", "AbortError"));
  }
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      window.clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

export function DocToCsvTool() {
  const lineItemsGridRef = useRef<AgGridReact<DocumentRow>>(null);
  const extractAbortRef = useRef<AbortController | null>(null);
  const [documentTypeId, setDocumentTypeId] =
    useState<TradeDocumentTypeId>("commercial_invoice");
  const [file, setFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [header, setHeader] = useState<DocumentRow | null>(null);
  const [lineItemRows, setLineItemRows] = useState<DocumentRow[] | null>(null);
  const [templateStore, setTemplateStore] =
    useState<ExportTemplateStore>(emptyStore);
  const [template, setTemplate] = useState<ExportTemplate | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [editedCells, setEditedCells] = useState<Record<string, true>>({});
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>("pdf");
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"landing" | "results">(
    "landing"
  );
  const [showEmptyHeader, setShowEmptyHeader] = useState(false);
  const [selectedRowCount, setSelectedRowCount] = useState(0);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState("");

  const documentType = getTradeDocumentType(documentTypeId);

  const commitStore = useCallback((store: ExportTemplateStore) => {
    setTemplateStore(store);
    saveExportTemplateStore(store);
  }, []);

  const commitTemplate = useCallback(
    (next: ExportTemplate) => {
      setTemplate(next);
      setTemplateStore((current) => {
        const stored = persistWorkingTemplate(current, next);
        saveExportTemplateStore(stored);
        return stored;
      });
    },
    []
  );

  const resetExtracted = useCallback(() => {
    setHeader(null);
    setLineItemRows(null);
    setEditedCells({});
    setSelectedRowCount(0);
    setWorkspaceTab("pdf");
    setInspectorOpen(true);
    setShowEmptyHeader(false);
    setSaveOpen(false);
  }, []);

  useEffect(() => {
    setTemplateStore(loadExportTemplateStore());
  }, []);

  useEffect(() => {
    if (!file) {
      setPdfUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPdfUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  useEffect(() => {
    if (!extracting) {
      setElapsedSeconds(0);
      return;
    }
    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 250);
    return () => window.clearInterval(interval);
  }, [extracting]);

  useEffect(() => {
    return () => {
      extractAbortRef.current?.abort();
    };
  }, []);

  const extractFile = useCallback(
    async (pdf: File, typeId: TradeDocumentTypeId) => {
      extractAbortRef.current?.abort();
      const abort = new AbortController();
      extractAbortRef.current = abort;

      setExtracting(true);
      setExtractError(null);
      setActiveView("landing");
      resetExtracted();

      try {
        const formData = new FormData();
        formData.append("file", pdf);
        formData.append("documentType", typeId);

        const startResponse = await fetch("/api/doc-to-csv/extract", {
          method: "POST",
          body: formData,
          signal: abort.signal,
        });
        const startData = (await startResponse.json().catch((): null => null)) as {
          requestId?: string;
          error?: string;
        } | null;

        if (!startResponse.ok) {
          throw new Error(startData?.error || "Failed to start extraction");
        }
        if (!startData?.requestId) {
          throw new Error("No extraction request id was returned");
        }

        const startedAt = Date.now();
        let pollFirst = true;
        while (!abort.signal.aborted) {
          if (!pollFirst) {
            await waitMs(EXTRACT_POLL_MS, abort.signal);
          }
          pollFirst = false;

          if (Date.now() - startedAt > EXTRACT_MAX_WAIT_MS) {
            throw new Error("Extraction timed out. Please try again.");
          }

          const statusResponse = await fetch(
            `/api/doc-to-csv/extract/${encodeURIComponent(startData.requestId)}?documentType=${encodeURIComponent(typeId)}`,
            { signal: abort.signal, cache: "no-store" }
          );
          const statusData = (await statusResponse
            .json()
            .catch((): null => null)) as {
              status?: string;
              header?: DocumentRow;
              lineItems?: DocumentRow[];
              error?: string;
            } | null;

          if (!statusResponse.ok && statusData?.status !== "failed") {
            throw new Error(
              statusData?.error || "Failed to check extraction status"
            );
          }

          if (statusData?.status === "failed") {
            throw new Error(statusData.error || "Extraction failed");
          }

          if (statusData?.status === "processing" || !statusData?.status) {
            continue;
          }

          if (statusData.status !== "complete") {
            continue;
          }

          if (!statusData.header || !statusData.lineItems) {
            throw new Error("No document data was returned");
          }

          if (
            statusData.lineItems.length === 0 &&
            !headerHasValues(statusData.header)
          ) {
            throw new Error("No data was found in this PDF.");
          }

          const rows = statusData.lineItems.map((item, index) => ({
            ...item,
            [ROW_ID_FIELD]: String(index + 1),
          }));
          const type = getTradeDocumentType(typeId);
          const store = loadExportTemplateStore();
          const nextTemplate = resolveTemplateForExtract(type, rows, store);

          setTemplateStore(store);
          setHeader(statusData.header);
          setLineItemRows(rows);
          commitTemplate(nextTemplate);
          setActiveView("results");
          return;
        }
      } catch (error) {
        if (isAbortError(error)) {
          return;
        }
        setExtractError(
          error instanceof Error
            ? error.message
            : "Failed to extract document data"
        );
      } finally {
        if (extractAbortRef.current === abort) {
          setExtracting(false);
        }
      }
    },
    [commitTemplate, resetExtracted]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const nextFile = acceptedFiles[0];
      if (!nextFile) {
        setExtractError("Please upload a PDF file.");
        return;
      }
      if (nextFile.size > MAX_FILE_SIZE_BYTES) {
        setExtractError("File is too large. Maximum size is 10MB.");
        return;
      }
      setFile(nextFile);
      void extractFile(nextFile, documentTypeId);
    },
    [documentTypeId, extractFile]
  );

  const onDropRejected = useCallback((rejections: FileRejection[]) => {
    const code = rejections[0]?.errors[0]?.code;
    if (code === "file-too-large") {
      setExtractError("File is too large. Maximum size is 10MB.");
      return;
    }
    if (code === "file-invalid-type") {
      setExtractError("Please upload a PDF file.");
      return;
    }
    setExtractError("Could not accept that file. PDF only, max 10MB.");
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE_BYTES,
    disabled: extracting,
    multiple: false,
  });

  const hasResults = header != null && lineItemRows != null;

  const selectDocumentType = (id: TradeDocumentTypeId) => {
    if (id === documentTypeId || extracting) {
      return;
    }
    setDocumentTypeId(id);
    setExtractError(null);
    resetExtracted();
    setTemplate(null);
    setActiveView("landing");
    if (file) {
      void extractFile(file, id);
    }
  };

  const goBackToLanding = () => {
    setActiveView("landing");
  };

  const viewResults = () => {
    setActiveView("results");
  };

  const toggleHeaderField = (field: string) => {
    if (!template) {
      return;
    }
    if (
      columnIsOnTemplate(template, { kind: "header", field })
    ) {
      const column = template.columns.find(
        (item) => item.source.kind === "header" && item.source.field === field
      );
      if (column) {
        commitTemplate(removeColumnFromTemplate(template, column.id));
      }
      return;
    }
    commitTemplate(addHeaderColumnToTemplate(documentType, template, field));
  };

  const onSourceCellChange = (
    rowId: string,
    field: string,
    value: DocumentCellValue
  ) => {
    if (!template) {
      return;
    }
    const column = template.columns.find((item) => item.id === field);
    if (!column) {
      return;
    }
    setEditedCells((current) => ({
      ...current,
      [editedCellKey(rowId, field)]: true,
    }));
    setLineItemRows((current) => {
      if (!current) {
        return current;
      }
      return applyColumnEdit(current, rowId, column, value);
    });
  };

  const onToggleTransform = (id: InvoiceTransformId) => {
    if (!template) {
      return;
    }
    commitTemplate({
      ...markTemplateDirty(template),
      transforms: toggleInvoiceTransform(template.transforms, id),
    });
  };

  const onHideColumn = (field: string) => {
    if (!template) {
      return;
    }
    const column = template.columns.find((item) => item.id === field);
    if (!column || column.hidden) {
      return;
    }
    commitTemplate(toggleColumnHidden(template, field));
  };

  const copyHeaderValue = async (field: string, label: string) => {
    if (!header) {
      return;
    }
    const value = header[field];
    if (!hasCellValue(value)) {
      return;
    }
    await navigator.clipboard.writeText(String(value));
    setCopiedField(field);
    window.setTimeout(() => {
      setCopiedField((current) => (current === field ? null : current));
    }, 1500);
    toast.success(`Copied ${label}`);
  };

  const selectTemplateId = (id: string) => {
    if (!lineItemRows) {
      return;
    }
    if (id === PRESET_FOUND_ID || id === PRESET_ENTRY_ID || id === PRESET_FORWARDING_ID) {
      const presetId: ExportPresetId =
        id === PRESET_ENTRY_ID
          ? "entry"
          : id === PRESET_FORWARDING_ID
            ? "forwarding"
            : "found";
      commitTemplate(presetTemplate(documentType, presetId, lineItemRows));
      setEditedCells({});
      return;
    }
    const saved = templateStore.templates.find((item) => item.id === id);
    if (saved) {
      commitTemplate({ ...saved, dirty: false });
      setEditedCells({});
    }
  };

  const saveCurrentTemplate = () => {
    if (!template) {
      return;
    }
    const { store, template: saved } = saveNamedTemplate(
      templateStore,
      template,
      template.name
    );
    commitStore(store);
    setTemplate(saved);
    setSaveOpen(false);
    toast.success("Template saved");
  };

  const saveCurrentTemplateAs = () => {
    if (!template) {
      return;
    }
    const { store, template: saved } = saveAsNamedTemplate(
      templateStore,
      template,
      saveName
    );
    commitStore(store);
    setTemplate(saved);
    setSaveOpen(false);
    setSaveName("");
    toast.success("Template saved");
  };

  const addRow = () => {
    if (!lineItemRows) {
      return;
    }
    const rowId = nextRowId(lineItemRows);
    setLineItemRows([...lineItemRows, emptyLineItem(documentType, rowId)]);
  };

  const deleteSelectedRows = () => {
    const selected = lineItemsGridRef.current?.api.getSelectedRows() ?? [];
    if (selected.length === 0 || !lineItemRows) {
      return;
    }
    const ids = new Set(selected.map((row) => String(row[ROW_ID_FIELD])));
    setLineItemRows(lineItemRows.filter((row) => !ids.has(String(row[ROW_ID_FIELD]))));
    setEditedCells((current) => {
      const next = { ...current };
      for (const key of Object.keys(next)) {
        const rowId = key.split(":")[0];
        if (ids.has(rowId)) {
          delete next[key];
        }
      }
      return next;
    });
    setSelectedRowCount(0);
  };

  const csvFileName = csvFileNameFromUpload(
    file?.name,
    documentType.csvFileName
  );
  const lineItemCount = lineItemRows?.length ?? 0;
  const displayRows = useMemo(() => {
    if (!lineItemRows || !template || !header) {
      return [];
    }
    const gridRows = buildGridRows(
      header,
      lineItemRows,
      template.columns,
      editedCells
    );
    return applyInvoiceTransforms(
      gridRows,
      template.transforms,
      editedCells,
      (key) => {
        const column = template.columns.find((item) => item.id === key);
        return column ? sourceFieldForColumn(column) : key;
      }
    );
  }, [editedCells, header, lineItemRows, template]);
  const headerColumnCount =
    template?.columns.filter((column) => column.source.kind === "header")
      .length ?? 0;
  const errorHint = extractError ? extractErrorHint(extractError) : null;

  const downloadCsv = () => {
    lineItemsGridRef.current?.api.exportDataAsCsv({
      fileName: csvFileName,
      allColumns: false,
      processHeaderCallback: (params) => {
        const field = params.column.getColDef().field;
        if (!field) {
          return params.column.getColDef().headerName ?? "";
        }
        return (
          template?.columns.find((column) => column.id === field)?.headerName ??
          params.column.getColDef().headerName ??
          field
        );
      },
    });
  };

  const selectInspectorTab = (tab: WorkspaceTab) => {
    if (inspectorOpen && workspaceTab === tab) {
      setInspectorOpen(false);
      return;
    }
    setWorkspaceTab(tab);
    setInspectorOpen(true);
  };

  if (header && lineItemRows && template && activeView === "results") {
    return (
      <AgGridProvider modules={GRID_MODULES}>
        <div
          className={`w-full flex-1 flex flex-col overflow-hidden bg-base-100 animate-results-enter ${RESULTS_VIEWPORT_CLASS}`}
        >
          <header className="shrink-0 border-b border-base-content/15 px-3 sm:px-4 py-2 flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={goBackToLanding}
              aria-label="Back"
              className="w-14 flex items-center justify-center gap-1.5 shrink-0 text-sm font-medium hover:text-base-content transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 hover:-translate-x-0.5 transition-transform" />
            </button>
            <div className="min-w-0 flex-1">
              <h2
                className="md:text-lg font-semibold text-base-content truncate"
                title={file?.name}
              >
                {file?.name ?? "Your document"}
              </h2>
              <p className="text-xs text-base-content/50 truncate">
                {documentType.label} · {lineItemCount} row
                {lineItemCount === 1 ? "" : "s"}
              </p>
            </div>
            <TemplateBar
              template={template}
              savedTemplates={templateStore.templates}
              saveOpen={saveOpen}
              saveName={saveName}
              onSaveName={setSaveName}
              onSelectId={selectTemplateId}
              onSave={saveCurrentTemplate}
              onSaveAs={saveCurrentTemplateAs}
              onToggleSaveAs={() => {
                setSaveName(isPresetId(template.id) ? "" : template.name);
                setSaveOpen((open) => !open);
              }}
            />
            <button
              type="button"
              className="btn btn-ghost btn-sm gap-1 shrink-0"
              onClick={addRow}
            >
              <PlusIcon className="w-4 h-4" />
              Add row
            </button>
            {selectedRowCount > 0 ? (
              <button
                type="button"
                className="btn btn-ghost btn-sm gap-1 shrink-0 text-error"
                onClick={deleteSelectedRows}
              >
                <TrashIcon className="w-4 h-4" />
                Delete {selectedRowCount}
              </button>
            ) : null}
            <button
              type="button"
              className="btn btn-primary gap-1.5 shrink-0"
              onClick={downloadCsv}
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Download CSV
            </button>
          </header>

          <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
            <div
              className={
                inspectorOpen
                  ? "flex flex-col md:flex-row min-h-0 overflow-hidden w-full md:w-2/5 h-[min(50vh,28rem)] md:h-auto"
                  : "flex flex-col md:flex-row shrink-0"
              }
            >
              <InspectorRail
                active={workspaceTab}
                open={inspectorOpen}
                fieldCount={headerColumnCount}
                ruleCount={template.transforms.length}
                renamedCount={
                  template.columns.filter((column) => column.hidden).length
                }
                onSelect={selectInspectorTab}
              />

              {inspectorOpen ? (
                <aside className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden border-b md:border-b-0 md:border-r border-base-content/15 bg-base-100">
                  {workspaceTab === "pdf" ? (
                    <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                      {pdfUrl ? (
                        <iframe
                          src={pdfUrl}
                          title={file?.name ?? "Uploaded document"}
                          className="w-full flex-1 min-h-0 bg-base-200"
                        />
                      ) : (
                        <p className="text-base text-base-content/70 px-4 pb-4">
                          PDF preview is unavailable.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 min-h-0 overflow-y-auto p-4">
                      {workspaceTab === "details" && (
                        <DocumentDetailsPanel
                          documentType={documentType}
                          header={header}
                          template={template}
                          showEmpty={showEmptyHeader}
                          copiedField={copiedField}
                          onShowEmpty={setShowEmptyHeader}
                          onCopy={copyHeaderValue}
                          onChangeHeader={(field, value) =>
                            setHeader((current) =>
                              current ? { ...current, [field]: value } : current
                            )
                          }
                          onToggleField={toggleHeaderField}
                        />
                      )}
                      {workspaceTab === "normalize" && (
                        <NormalizeRules
                          enabled={template.transforms}
                          onToggle={onToggleTransform}
                          onReset={() =>
                            commitTemplate({
                              ...markTemplateDirty(template),
                              transforms: [],
                            })
                          }
                        />
                      )}
                      {workspaceTab === "names" && (
                        <ColumnMapper
                          documentType={documentType}
                          template={template}
                          onChange={commitTemplate}
                        />
                      )}
                    </div>
                  )}
                </aside>
              ) : null}
            </div>

            <div
              className={`min-h-0 overflow-hidden ${inspectorOpen ? "flex-1 md:w-3/5 md:flex-none" : "flex-1"
                }`}
            >
              {template.columns.length === 0 ? (
                <div className="h-full flex items-center justify-center p-8 text-center">
                  <p className="text-sm text-base-content/70 max-w-sm leading-relaxed">
                    No line columns to show. Add fields from Details or Manage
                    Columns, or switch to US entry lines.
                  </p>
                </div>
              ) : (
                <LineItemsGrid
                  gridRef={lineItemsGridRef}
                  rowData={displayRows}
                  columns={template.columns}
                  csvFileName={csvFileName}
                  onHideColumn={onHideColumn}
                  onColumnMoved={(orderedIds) =>
                    commitTemplate(reorderTemplateColumns(template, orderedIds))
                  }
                  onSelectionChanged={setSelectedRowCount}
                  onSourceCellChange={onSourceCellChange}
                />
              )}
            </div>
          </div>
        </div>
      </AgGridProvider>
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col bg-base-100">
      <div className="w-full bg-base-100">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-12 flex flex-col items-center gap-6 lg:gap-12">
          <div className="text-center flex flex-col items-center gap-3 max-w-3xl">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-base-content tracking-tight leading-[1.15]">
              Save <span className="text-primary">Hours</span> On Entry
              Processing
            </h1>
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm md:text-base lg:text-lg text-base-content/55 leading-relaxed">
                Extract data from commercial invoices, packing lists, and bills
                of lading into a spreadsheet you can review, clean, and import
                — without typing line by line.
              </p>
            </div>
          </div>

          <section className="w-full flex flex-col gap-7 rounded-3xl border-2 border-base-content/15 bg-base-100 p-5 sm:p-8 md:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
            <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 md:items-stretch">
              <div className="flex flex-col gap-5 min-w-0">
                <SectionHeading
                  step={1}
                  title="Choose Document Type"
                  prominent
                />
                <DocumentTypePicker
                  selected={documentTypeId}
                  disabled={extracting}
                  onSelect={selectDocumentType}
                />
              </div>

              <div className="flex flex-col gap-5 min-w-0">
                <SectionHeading step={2} title="Upload File" prominent />
                {extracting ? (
                  <div className="w-full border-2 border-dashed rounded-2xl p-10 md:p-12 text-center flex flex-col items-center justify-center gap-3 flex-1 min-h-56 border-primary bg-primary/[0.03]">
                    <span className="loading loading-spinner loading-lg text-primary" />
                    <p className="text-sm font-semibold text-base-content">
                      Extracting Data… {elapsedSeconds}s
                    </p>
                    {file ? (
                      <p className="text-xs text-base-content/55 truncate max-w-full">
                        {file.name}
                      </p>
                    ) : null}
                    <p className="text-xs text-base-content/60">
                      This can take a few minutes.
                    </p>
                  </div>
                ) : hasResults ? (
                  <div
                    {...getRootProps()}
                    className={`w-full border-2 border-dashed border-primary bg-primary/5 rounded-2xl p-10 md:p-12 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 flex-1 min-h-56`}
                  >
                    <input {...getInputProps()} />
                    {isDragActive ? (
                      <>
                        <DocumentArrowUpIcon className="w-12 h-12 text-primary" />
                        <p className="text-sm font-semibold text-base-content">
                          Drop the PDF here
                        </p>
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="w-12 h-12 text-primary" />
                        <p className="text-sm font-semibold text-base-content">
                          Data Extracted Successfully
                        </p>
                        {file ? (
                          <p className="text-sm text-base-content/70 truncate max-w-full">
                            {file.name}
                          </p>
                        ) : null}
                        <p className="text-sm font-semibold text-primary mt-1">
                          Click or drop to upload another PDF
                        </p>
                        <p className="text-xs text-base-content/60">
                          PDF only, max 10MB
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <div
                    {...getRootProps()}
                    className={`w-full border-2 border-dashed rounded-2xl p-10 md:p-12 text-center cursor-pointer transition flex flex-col items-center justify-center gap-4 flex-1 min-h-56 ${isDragActive
                      ? "border-primary bg-primary/5"
                      : "border-primary bg-primary/[0.03] hover:bg-primary/5"
                      }`}
                  >
                    <input {...getInputProps()} />
                    <DocumentArrowUpIcon className="w-12 h-12 text-primary" />
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-semibold text-base-content">
                        {file
                          ? file.name
                          : isDragActive
                            ? "Drop the PDF here"
                            : `Upload your ${documentType.label}`}
                      </p>
                      <p className="text-xs text-base-content/60">
                        {file
                          ? "Click or drop to replace"
                          : "PDF only, max 10MB"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {extractError ? (
              <div
                role="alert"
                className="rounded-2xl border border-error/30 bg-error/10 px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-error">
                    {extractError}
                  </p>
                  {errorHint ? (
                    <p className="text-sm text-base-content/70 mt-1">
                      {errorHint}
                    </p>
                  ) : null}
                </div>
                {file ? (
                  <button
                    type="button"
                    className="btn btn-error btn-sm shrink-0"
                    onClick={() => extractFile(file, documentTypeId)}
                  >
                    Retry
                  </button>
                ) : null}
              </div>
            ) : null}

            {hasResults && !extracting ? (
              <button
                type="button"
                className="btn btn-primary btn-lg w-full flex items-center justify-center gap-2"
                onClick={viewResults}
              >
                View Results <ArrowRightIcon className="w-5 h-5" />
              </button>
            ) : file && !extracting && !extractError ? (
              <button
                type="button"
                className="w-full btn btn-primary btn-lg self-center min-w-48"
                onClick={() => extractFile(file, documentTypeId)}
              >
                Extract Data
              </button>
            ) : null}
          </section>

          <div className="w-full flex flex-col items-center pt-4 border-t border-base-content/10">
            <SellingPoints />
          </div>
        </div>
      </div>
    </div>
  );
}
