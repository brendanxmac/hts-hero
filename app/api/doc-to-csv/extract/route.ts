import { NextRequest, NextResponse } from "next/server";
import {
  DATALAB_EXTRACT_URL,
  datalabErrorMessage,
  isDatalabRequestId,
} from "../../../../libs/datalab-extract";
import {
  extractionSchemaFor,
  getTradeDocumentType,
  isTradeDocumentTypeId,
} from "../../../../libs/trade-documents";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

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

    const requestId =
      typeof submitBody?.request_id === "string" ? submitBody.request_id : null;

    if (!requestId || !isDatalabRequestId(requestId)) {
      return NextResponse.json(
        { error: "Datalab did not return a request id" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      requestId,
      documentType: documentType.id,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to start document extraction";
    console.error("doc-to-csv extract start error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
