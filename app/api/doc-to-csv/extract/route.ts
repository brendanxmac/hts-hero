import { NextRequest, NextResponse } from "next/server";
import {
  extractionSchemaFor,
  getTradeDocumentType,
  isTradeDocumentTypeId,
  parseExtractedDocument,
} from "../../../../libs/trade-documents";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const DATALAB_EXTRACT_URL = "https://www.datalab.to/api/v1/extract";
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const POLL_INTERVAL_MS = 2000;
const MAX_WAIT_MS = 55_000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function datalabErrorMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object") {
    return fallback;
  }

  const record = body as Record<string, unknown>;
  if (typeof record.error === "string" && record.error) {
    return record.error;
  }

  if (Array.isArray(record.detail) && record.detail.length > 0) {
    const first = record.detail[0] as { msg?: string };
    if (first?.msg) {
      return first.msg;
    }
  }

  if (typeof record.detail === "string" && record.detail) {
    return record.detail;
  }

  return fallback;
}

async function pollExtractResult(
  checkUrl: string,
  apiKey: string
): Promise<Record<string, unknown>> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < MAX_WAIT_MS) {
    const response = await fetch(checkUrl, {
      headers: { "X-API-Key": apiKey },
      cache: "no-store",
    });
    const body = (await response.json().catch(() => null)) as Record<
      string,
      unknown
    > | null;

    if (!response.ok) {
      throw new Error(
        datalabErrorMessage(body, `Datalab poll failed (${response.status})`)
      );
    }

    if (!body) {
      throw new Error("Datalab poll returned an empty response");
    }

    const status = body.status;
    if (status === "complete") {
      return body;
    }
    if (status === "failed") {
      throw new Error(datalabErrorMessage(body, "Extraction failed"));
    }

    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error("Extraction timed out. Please try again.");
}

function parseExtraction(result: Record<string, unknown>): unknown {
  const raw = result.extraction_schema_json;
  if (raw == null) {
    throw new Error("Datalab did not return extracted document data");
  }
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      throw new Error("Failed to parse extracted document data");
    }
  }
  return raw;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.DATALAB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Document extraction is not configured" },
      { status: 500 }
    );
  }

  try {
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json(
        { error: "Please upload a trade document PDF" },
        { status: 400 }
      );
    }

    const documentTypeRaw = formData.get("documentType");
    if (!isTradeDocumentTypeId(documentTypeRaw)) {
      return NextResponse.json(
        { error: "Select a document type" },
        { status: 400 }
      );
    }
    const documentType = getTradeDocumentType(documentTypeRaw);

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Please upload a trade document PDF" },
        { status: 400 }
      );
    }

    if (file.type && file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File is too large. Maximum size is 10MB" },
        { status: 400 }
      );
    }

    const datalabForm = new FormData();
    datalabForm.append("file", file, file.name || `${documentType.id}.pdf`);
    datalabForm.append(
      "page_schema",
      JSON.stringify(extractionSchemaFor(documentType))
    );
    datalabForm.append("extraction_mode", "fast");

    const submitResponse = await fetch(DATALAB_EXTRACT_URL, {
      method: "POST",
      headers: { "X-API-Key": apiKey },
      body: datalabForm,
    });

    const submitBody = (await submitResponse.json().catch(() => null)) as Record<
      string,
      unknown
    > | null;

    if (!submitResponse.ok || submitBody?.success === false) {
      return NextResponse.json(
        {
          error: datalabErrorMessage(
            submitBody,
            `Failed to start extraction (${submitResponse.status})`
          ),
        },
        { status: 502 }
      );
    }

    const checkUrl =
      typeof submitBody?.request_check_url === "string"
        ? submitBody.request_check_url
        : null;

    if (!checkUrl) {
      return NextResponse.json(
        { error: "Datalab did not return a status URL" },
        { status: 502 }
      );
    }

    const completed = await pollExtractResult(checkUrl, apiKey);
    if (completed.success === false) {
      return NextResponse.json(
        { error: datalabErrorMessage(completed, "Extraction failed") },
        { status: 502 }
      );
    }

    const extracted = parseExtraction(completed);
    const { header, lineItems } = parseExtractedDocument(
      documentType,
      extracted
    );

    return NextResponse.json({
      documentType: documentType.id,
      header,
      lineItems,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to extract document data";
    console.error("doc-to-csv extract error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
