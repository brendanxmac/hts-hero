"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type RefObject,
  type SVGProps,
} from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import {
  AdjustmentsHorizontalIcon,
  ArrowsRightLeftIcon,
  ArrowDownTrayIcon,
  CheckIcon,
  ClipboardDocumentIcon,
  CubeIcon,
  DocumentArrowUpIcon,
  DocumentIcon,
  DocumentTextIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TableCellsIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import type {
  CellKeyDownEvent,
  CellValueChangedEvent,
  ColDef,
  GridApi,
} from "ag-grid-community";
import { AllCommunityModule, themeQuartz } from "ag-grid-community";
import {
  AgGridProvider,
  AgGridReact,
  type CustomInnerHeaderProps,
} from "ag-grid-react";
import {
  applyHeaderFieldsToLineItems,
  columnsForLineItems,
  duplicateExportNames,
  getTradeDocumentType,
  resolveColumnNames,
  ROW_ID_FIELD,
  TRADE_DOCUMENT_TYPES,
  type DocumentCellValue,
  type DocumentColumn,
  type DocumentRow,
  type TradeDocumentTypeId,
} from "../libs/trade-documents";
import {
  applyInvoiceTransforms,
  INVOICE_TRANSFORMS,
  toggleInvoiceTransform,
  type InvoiceTransformId,
} from "../libs/invoice-transforms";
import config from "@/config";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const GRID_MODULES = [AllCommunityModule];

const DOCUMENT_TYPE_ICONS: Record<
  TradeDocumentTypeId,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  commercial_invoice: DocumentTextIcon,
  packing_list: CubeIcon,
  bill_of_lading: TruckIcon,
};

function formatHeaderValue(value: DocumentCellValue | undefined): string {
  if (value == null || value === "") {
    return "—";
  }
  return String(value);
}

function countHiddenColumns(api: GridApi<DocumentRow>): number {
  return (api.getColumns() ?? []).filter((column) => !column.isVisible()).length;
}

function HideColumnInnerHeader(props: CustomInnerHeaderProps<DocumentRow>) {
  const hideColumn = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
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
  filter: true,
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
  columns: DocumentColumn[];
  columnNames: Record<string, string>;
  csvFileName: string;
  onHiddenCountChange: (count: number) => void;
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
  columnNames,
  csvFileName,
  onHiddenCountChange,
  onSourceCellChange,
}: LineItemsGridProps) {
  const columnNamesRef = useRef(columnNames);
  columnNamesRef.current = columnNames;

  const columnDefs = useMemo(
    () =>
      columns.map((column) => ({
        field: column.field,
        headerName: column.headerName,
        headerValueGetter: () =>
          columnNamesRef.current[column.field] ?? column.headerName,
        minWidth:
          column.field === "description" || column.field.includes("address")
            ? 240
            : 150,
      })),
    [columns]
  );

  useEffect(() => {
    gridRef.current?.api?.refreshHeader();
  }, [columnNames, gridRef]);

  const onCellValueChanged = (event: CellValueChangedEvent<DocumentRow>) => {
    const field = event.colDef.field;
    const rowId = event.data?.[ROW_ID_FIELD];
    if (!field || field === ROW_ID_FIELD || rowId == null || rowId === "") {
      return;
    }
    onSourceCellChange(String(rowId), field, event.newValue ?? "");
  };

  return (
    <div className="w-full rounded-xl overflow-hidden border border-base-content/10">
      <AgGridReact<DocumentRow>
        ref={gridRef}
        theme={themeQuartz}
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        getRowId={(params) => String(params.data?.[ROW_ID_FIELD] ?? "")}
        domLayout="autoHeight"
        undoRedoCellEditing
        undoRedoCellEditingLimit={50}
        stopEditingWhenCellsLoseFocus={false}
        enableCellTextSelection
        ensureDomOrder
        animateRows={false}
        defaultCsvExportParams={{
          allColumns: false,
          fileName: csvFileName,
          processHeaderCallback: (params) => {
            const field = params.column.getColDef().field;
            if (!field) {
              return params.column.getColDef().headerName ?? "";
            }
            return (
              columnNamesRef.current[field] ??
              params.column.getColDef().headerName ??
              field
            );
          },
        }}
        onCellKeyDown={copyCellOnKeyDown}
        onCellValueChanged={onCellValueChanged}
        onGridReady={(event) => onHiddenCountChange(countHiddenColumns(event.api))}
        onColumnVisible={(event) =>
          onHiddenCountChange(countHiddenColumns(event.api))
        }
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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {TRADE_DOCUMENT_TYPES.map((type) => {
        const Icon = DOCUMENT_TYPE_ICONS[type.id];
        const isSelected = selected === type.id;
        return (
          <button
            key={type.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(type.id)}
            className={`text-left rounded-2xl border px-4 py-4 flex flex-col gap-2 transition ${isSelected
              ? "border-primary bg-primary/10 ring-1 ring-primary/30"
              : "border-base-content/10 bg-base-100 hover:border-base-content/25 hover:bg-base-200/40"
              } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <Icon
              className={`w-6 h-6 ${isSelected ? "text-primary" : "text-base-content/45"
                }`}
            />
            <span className="text-sm font-semibold text-base-content">
              {type.label}
            </span>
            <span className="text-xs text-base-content/60 leading-relaxed">
              {type.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}

type WorkspaceTab = "pdf" | "fields" | "normalize" | "names";

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
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs text-base-content/60 leading-relaxed">
          Toggle a rule to clean values in the table. Turn it off to restore
          the extracted value.
        </p>
        {enabled.length > 0 && (
          <button
            type="button"
            className="btn btn-ghost btn-xs shrink-0"
            onClick={onReset}
          >
            Reset
          </button>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {INVOICE_TRANSFORMS.map((rule) => {
          const isOn = enabledSet.has(rule.id);
          return (
            <label
              key={rule.id}
              className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-colors ${isOn
                ? "bg-primary/10 ring-1 ring-primary/20"
                : "bg-base-200/50 hover:bg-base-200"
                }`}
            >
              <span className="min-w-0 flex flex-col gap-0.5">
                <span className="text-sm font-medium text-base-content">
                  {rule.label}
                </span>
                <span className="text-[11px] text-base-content/50 truncate">
                  {rule.example}
                </span>
              </span>
              <input
                type="checkbox"
                className="toggle toggle-primary toggle-sm shrink-0"
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

function ColumnMapper({
  columns,
  names,
  onRename,
  onReset,
}: {
  columns: DocumentColumn[];
  names: Record<string, string>;
  onRename: (field: string, name: string) => void;
  onReset: () => void;
}) {
  const renamedCount = columns.filter(
    (column) => (names[column.field] ?? column.headerName) !== column.headerName
  ).length;
  const duplicates = duplicateExportNames(columns, names);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs text-base-content/60 leading-relaxed">
          Type the header your CMS, ACE, or ERP expects. The table updates as
          you type.
        </p>
        {renamedCount > 0 && (
          <button
            type="button"
            className="btn btn-ghost btn-xs shrink-0"
            onClick={onReset}
          >
            Reset
          </button>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {columns.map((column) => {
          const current = names[column.field] ?? column.headerName;
          const changed = current !== column.headerName;
          return (
            <label
              key={column.field}
              className={`flex flex-col gap-1 rounded-lg px-3 py-2.5 cursor-text transition-colors focus-within:ring-1 focus-within:ring-primary/40 ${changed
                ? "bg-primary/10 ring-1 ring-primary/20"
                : "bg-base-200/50 hover:bg-base-200"
                }`}
            >
              <span className="text-[10px] uppercase tracking-wide text-base-content/40 truncate">
                {column.headerName}
              </span>
              <input
                type="text"
                className="bg-transparent text-sm font-medium text-base-content outline-none w-full min-w-0"
                value={current}
                onChange={(event) => onRename(column.field, event.target.value)}
                onFocus={(event) => event.target.select()}
                aria-label={`Export name for ${column.headerName}`}
              />
            </label>
          );
        })}
      </div>
      {duplicates.length > 0 && (
        <p className="text-xs text-warning">
          Some export names are duplicated. Most import templates need unique
          column headers.
        </p>
      )}
    </div>
  );
}

function HeaderFieldsPanel({
  columns,
  header,
  includedHeaderFields,
  copiedField,
  onCopy,
  onToggle,
}: {
  columns: DocumentColumn[];
  header: DocumentRow;
  includedHeaderFields: string[];
  copiedField: string | null;
  onCopy: (field: string, label: string) => void;
  onToggle: (field: string) => void;
}) {
  const ordered = [...columns].sort((a, b) => {
    const aHas = header[a.field] != null && header[a.field] !== "";
    const bHas = header[b.field] != null && header[b.field] !== "";
    if (aHas === bHas) {
      return 0;
    }
    return aHas ? -1 : 1;
  });

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-base-content/60 leading-relaxed">
        Add document-level details onto every row. The table gains a column as
        soon as you toggle one on.
      </p>
      <div className="flex flex-col gap-2">
        {ordered.map((column) => {
          const included = includedHeaderFields.includes(column.field);
          const rawValue = header[column.field];
          const hasValue = rawValue != null && rawValue !== "";
          const copied = copiedField === column.field;

          return (
            <div
              key={column.field}
              className={`flex items-start justify-between gap-3 rounded-lg px-3 py-2.5 transition-colors ${included
                ? "bg-primary/10 ring-1 ring-primary/20"
                : "bg-base-200/50"
                }`}
            >
              <button
                type="button"
                className={`min-w-0 flex-1 text-left flex flex-col gap-0.5 rounded-md ${hasValue ? "cursor-copy hover:opacity-80" : "cursor-default"
                  }`}
                onClick={() => onCopy(column.field, column.headerName)}
                disabled={!hasValue}
                title={hasValue ? "Click to copy" : "No value to copy"}
              >
                <span className="text-xs text-base-content/50">
                  {column.headerName}
                </span>
                <span className="flex items-center gap-1.5 min-w-0">
                  <span
                    className={`text-sm truncate ${hasValue
                      ? "font-medium text-base-content"
                      : "text-base-content/40"
                      }`}
                  >
                    {formatHeaderValue(rawValue)}
                  </span>
                  {hasValue &&
                    (copied ? (
                      <CheckIcon className="w-4 h-4 shrink-0 text-success" />
                    ) : (
                      <ClipboardDocumentIcon className="w-4 h-4 shrink-0 text-base-content/35" />
                    ))}
                </span>
              </button>
              <input
                type="checkbox"
                className="toggle toggle-primary toggle-sm shrink-0 mt-1"
                checked={included}
                onChange={() => onToggle(column.field)}
                aria-label={`Add ${column.headerName} to each row`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WorkspaceTabs({
  active,
  fieldCount,
  ruleCount,
  renamedCount,
  onChange,
}: {
  active: WorkspaceTab;
  fieldCount: number;
  ruleCount: number;
  renamedCount: number;
  onChange: (tab: WorkspaceTab) => void;
}) {
  const tabs: {
    id: WorkspaceTab;
    label: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    count?: number;
  }[] = [
      { id: "pdf", label: "Document", icon: DocumentIcon },
      { id: "fields", label: "Fields", icon: TableCellsIcon, count: fieldCount },
      {
        id: "normalize",
        label: "Clean",
        icon: AdjustmentsHorizontalIcon,
        count: ruleCount,
      },
      {
        id: "names",
        label: "Names",
        icon: ArrowsRightLeftIcon,
        count: renamedCount,
      },
    ];

  return (
    <div className="grid grid-cols-4 border-b border-base-content/10">
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-2 py-2.5 text-xs font-medium transition-colors ${isActive
              ? "text-primary bg-primary/5"
              : "text-base-content/55 hover:text-base-content hover:bg-base-200/60"
              }`}
          >
            <tab.icon className="w-4 h-4 shrink-0" />
            <span>{tab.label}</span>
            {tab.count ? (
              <span className="text-[10px] leading-none px-1.5 py-0.5 rounded-full bg-primary/15 text-primary">
                {tab.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

function SectionHeading({
  step,
  title,
  description,
}: {
  step: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-content text-sm font-bold">
        {step}
      </span>
      <div className="flex flex-col gap-1 pt-0.5">
        <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-base-content">
          {title}
        </h2>
        <p className="text-sm text-base-content/60 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

export function DocToCsvTool() {
  const lineItemsGridRef = useRef<AgGridReact<DocumentRow>>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [documentTypeId, setDocumentTypeId] =
    useState<TradeDocumentTypeId>("commercial_invoice");
  const [file, setFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [header, setHeader] = useState<DocumentRow | null>(null);
  const [lineItemRows, setLineItemRows] = useState<DocumentRow[] | null>(null);
  const [includedHeaderFields, setIncludedHeaderFields] = useState<string[]>(
    []
  );
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [hiddenColumnCount, setHiddenColumnCount] = useState(0);
  const [enabledTransforms, setEnabledTransforms] = useState<
    InvoiceTransformId[]
  >([]);
  const [columnNameOverrides, setColumnNameOverrides] = useState<
    Record<string, string>
  >({});
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>("pdf");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const documentType = getTradeDocumentType(documentTypeId);

  const resetResults = useCallback(() => {
    setHeader(null);
    setLineItemRows(null);
    setIncludedHeaderFields([]);
    setHiddenColumnCount(0);
    setEnabledTransforms([]);
    setColumnNameOverrides({});
    setWorkspaceTab("pdf");
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

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const nextFile = acceptedFiles[0];
      if (!nextFile) {
        toast.error("Please upload a PDF file");
        return;
      }
      if (nextFile.size > MAX_FILE_SIZE_BYTES) {
        toast.error("File is too large. Maximum size is 10MB");
        return;
      }
      setFile(nextFile);
      resetResults();
    },
    [resetResults]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE_BYTES,
    disabled: extracting,
    multiple: false,
  });

  const selectDocumentType = (id: TradeDocumentTypeId) => {
    if (id === documentTypeId) {
      return;
    }
    setDocumentTypeId(id);
    resetResults();
  };

  const extract = async () => {
    if (!file) {
      toast.error("Upload a trade document PDF first");
      return;
    }

    setExtracting(true);
    resetResults();

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", documentTypeId);

      const response = await fetch("/api/doc-to-csv/extract", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json().catch((): null => null)) as {
        header?: DocumentRow;
        lineItems?: DocumentRow[];
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(data?.error || "Failed to extract document data");
      }

      if (!data?.header || !data.lineItems) {
        throw new Error("No document data was returned");
      }

      setHeader(data.header);
      setLineItemRows(
        data.lineItems.map((item, index) => ({
          ...item,
          [ROW_ID_FIELD]: String(index + 1),
        }))
      );
      window.setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 50);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to extract document data"
      );
    } finally {
      setExtracting(false);
    }
  };

  const toggleHeaderField = (field: string) => {
    if (!header || !lineItemRows) {
      return;
    }

    const nextIncluded = includedHeaderFields.includes(field)
      ? includedHeaderFields.filter((included) => included !== field)
      : [...includedHeaderFields, field];

    setIncludedHeaderFields(nextIncluded);
    setLineItemRows(
      applyHeaderFieldsToLineItems(
        documentType,
        header,
        lineItemRows,
        nextIncluded
      )
    );
  };

  const onSourceCellChange = (
    rowId: string,
    field: string,
    value: DocumentCellValue
  ) => {
    setLineItemRows((current) => {
      if (!current) {
        return current;
      }
      return current.map((row) =>
        String(row[ROW_ID_FIELD]) === rowId ? { ...row, [field]: value } : row
      );
    });
  };

  const onToggleTransform = (id: InvoiceTransformId) => {
    setEnabledTransforms((current) => toggleInvoiceTransform(current, id));
  };

  const copyHeaderValue = async (field: string, label: string) => {
    if (!header) {
      return;
    }
    const value = header[field];
    if (value == null || value === "") {
      return;
    }
    await navigator.clipboard.writeText(String(value));
    setCopiedField(field);
    window.setTimeout(() => {
      setCopiedField((current) => (current === field ? null : current));
    }, 1500);
    toast.success(`Copied ${label}`);
  };

  const downloadCsv = () => {
    lineItemsGridRef.current?.api.exportDataAsCsv({
      fileName: documentType.csvFileName,
      allColumns: false,
      processHeaderCallback: (params) => {
        const field = params.column.getColDef().field;
        if (!field) {
          return params.column.getColDef().headerName ?? "";
        }
        return columnNames[field] ?? params.column.getColDef().headerName ?? field;
      },
    });
  };

  const showAllColumns = () => {
    const api = lineItemsGridRef.current?.api;
    const columns = api?.getColumns();
    if (!api || !columns?.length) {
      return;
    }
    api.setColumnsVisible(columns, true);
  };

  const lineItemColumns = columnsForLineItems(
    documentType,
    includedHeaderFields
  );
  const columnNames = useMemo(
    () => resolveColumnNames(lineItemColumns, columnNameOverrides),
    [lineItemColumns, columnNameOverrides]
  );
  const lineItemCount = lineItemRows?.length ?? 0;
  const displayRows = useMemo(
    () =>
      lineItemRows
        ? applyInvoiceTransforms(lineItemRows, enabledTransforms)
        : [],
    [lineItemRows, enabledTransforms]
  );
  const renamedCount = lineItemColumns.filter(
    (column) =>
      (columnNames[column.field] ?? column.headerName) !== column.headerName
  ).length;

  return (
    <div className="w-full flex-1 flex flex-col">
      <div className="w-full border-b border-base-content/10 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="w-full max-w-5xl mx-auto px-4 py-14 flex flex-col items-center gap-10">
          <div className="text-center flex flex-col items-center gap-4">
            {/* <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Documents to Spreadsheet, Fast!
            </p> */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-base-content leading-tight">
              Convert Trade Documents to Spreadsheets in Seconds
            </h1>
            <p className="text-base text-base-content/70 max-w-2xl leading-relaxed">
              Turn commercial invoices, packing lists, and bills of lading into
              clean spreadsheets for easy import into your CMS, ERP, and other systems — without retyping every line.
            </p>
          </div>

          <section className="w-full flex flex-col gap-5">
            <SectionHeading
              step={1}
              title="Choose a document and upload"
              description="Select the document type so we extract the right fields, then drop in a PDF up to 10MB."
            />

            <DocumentTypePicker
              selected={documentTypeId}
              disabled={extracting}
              onSelect={selectDocumentType}
            />

            <div
              {...getRootProps()}
              className={`w-full border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition flex flex-col items-center gap-3 ${extracting ? "opacity-60 cursor-not-allowed" : ""
                } ${isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-base-content/20 bg-base-100 hover:border-base-content/40"
                }`}
            >
              <input {...getInputProps()} />
              <DocumentArrowUpIcon className="w-10 h-10 text-base-content/40" />
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-base-content">
                  {file
                    ? file.name
                    : isDragActive
                      ? "Drop the PDF here"
                      : `Drag and drop a ${documentType.label.toLowerCase()} PDF`}
                </p>
                <p className="text-xs text-base-content/60">
                  {file ? "Click or drop to replace" : "PDF only, max 10MB"}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-lg self-center min-w-48"
              onClick={extract}
              disabled={!file || extracting}
            >
              {extracting && (
                <span className="loading loading-spinner loading-sm" />
              )}
              {extracting
                ? "Extracting…"
                : `Extract ${documentType.label}`}
            </button>

            <ul className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {[
                {
                  icon: ShieldCheckIcon,
                  title: "Secure",
                  body: "We never store your documents.",
                },
                {
                  icon: SparklesIcon,
                  title: "Built for trade docs",
                  body: "Extraction tuned for invoices, packing lists, and bills of lading.",
                },
                {
                  icon: WrenchScrewdriverIcon,
                  title: "Ready to import",
                  body: (
                    <>
                      Normalize values and rename columns to match the systems
                      you already use. If a file doesn&apos;t work well,{" "}
                      <a
                        href={`mailto:${config.resend.supportEmail}`}
                        className="link link-primary font-medium"
                        onClick={(event) => event.stopPropagation()}
                      >
                        email us
                      </a>
                      .
                    </>
                  ),
                },
              ].map((item) => (
                <li
                  key={item.title}
                  className="flex items-start gap-3 rounded-xl bg-base-100/80 border border-base-content/10 px-4 py-4"
                >
                  <item.icon className="w-5 h-5 shrink-0 text-primary mt-0.5" />
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold text-base-content">
                      {item.title}
                    </p>
                    <p className="text-xs text-base-content/60 leading-relaxed">
                      {item.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {header && lineItemRows && (
        <AgGridProvider modules={GRID_MODULES}>
          <div
            ref={resultsRef}
            className="w-full max-w-[100rem] mx-auto px-4 py-8 flex flex-col gap-5"
          >
            <SectionHeading
              step={2}
              title="Review, adjust, and export"
              description="The spreadsheet stays in view. Check it against the PDF, then add fields, clean values, or rename columns — every change shows up immediately."
            />

            <div className="flex flex-col lg:grid lg:grid-cols-[minmax(300px,420px)_minmax(0,1fr)] gap-4 lg:gap-5 lg:items-start">
              <aside className="lg:sticky lg:top-20 lg:h-[calc(100vh-6.5rem)] flex flex-col min-h-[28rem] rounded-2xl border border-base-content/10 bg-base-100 overflow-hidden">
                <WorkspaceTabs
                  active={workspaceTab}
                  fieldCount={includedHeaderFields.length}
                  ruleCount={enabledTransforms.length}
                  renamedCount={renamedCount}
                  onChange={setWorkspaceTab}
                />
                <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                  {workspaceTab === "pdf" ? (
                    pdfUrl ? (
                      <iframe
                        src={pdfUrl}
                        title={file?.name ?? "Uploaded document"}
                        className="w-full h-full min-h-[28rem] lg:min-h-0 bg-base-200"
                      />
                    ) : (
                      <p className="text-sm text-base-content/60 p-4">
                        PDF preview is unavailable.
                      </p>
                    )
                  ) : (
                    <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                      {workspaceTab === "fields" && (
                        <HeaderFieldsPanel
                          columns={documentType.headerColumns}
                          header={header}
                          includedHeaderFields={includedHeaderFields}
                          copiedField={copiedField}
                          onCopy={copyHeaderValue}
                          onToggle={toggleHeaderField}
                        />
                      )}
                      {workspaceTab === "normalize" && (
                        <NormalizeRules
                          enabled={enabledTransforms}
                          onToggle={onToggleTransform}
                          onReset={() => setEnabledTransforms([])}
                        />
                      )}
                      {workspaceTab === "names" && (
                        <ColumnMapper
                          columns={lineItemColumns}
                          names={columnNames}
                          onRename={(field, name) =>
                            setColumnNameOverrides((current) => ({
                              ...current,
                              [field]: name,
                            }))
                          }
                          onReset={() => setColumnNameOverrides({})}
                        />
                      )}
                    </div>
                  )}
                </div>
              </aside>

              <div className="min-w-0 flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="text-sm font-semibold text-base-content">
                      {lineItemCount} row{lineItemCount === 1 ? "" : "s"} ready
                      to export
                    </p>
                    <p className="text-xs text-base-content/60">
                      {[
                        enabledTransforms.length > 0
                          ? `${enabledTransforms.length} normalize rule${enabledTransforms.length === 1 ? "" : "s"
                          } applied`
                          : null,
                        renamedCount > 0
                          ? `${renamedCount} column${renamedCount === 1 ? "" : "s"
                          } renamed`
                          : null,
                        hiddenColumnCount > 0
                          ? `${hiddenColumnCount} hidden column${hiddenColumnCount === 1 ? "" : "s"
                          } excluded`
                          : "All currently visible columns included",
                      ]
                        .filter(Boolean)
                        .join(". ") + "."}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {hiddenColumnCount > 0 && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={showAllColumns}
                      >
                        Show hidden columns
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-primary gap-2 shadow-lg shadow-primary/20"
                      onClick={downloadCsv}
                    >
                      <ArrowDownTrayIcon className="w-5 h-5" />
                      Download CSV
                    </button>
                  </div>
                </div>

                <LineItemsGrid
                  gridRef={lineItemsGridRef}
                  rowData={displayRows}
                  columns={lineItemColumns}
                  columnNames={columnNames}
                  csvFileName={documentType.csvFileName}
                  onHiddenCountChange={setHiddenColumnCount}
                  onSourceCellChange={onSourceCellChange}
                />
              </div>
            </div>
          </div>
        </AgGridProvider>
      )}
    </div>
  );
}
