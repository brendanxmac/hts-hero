import { NextRequest, NextResponse } from "next/server";
import {
  datalabErrorMessage,
  datalabExtractCheckUrl,
  isDatalabRequestId,
  parseExtraction,
} from "../../../../../libs/datalab-extract";
import {
  getTradeDocumentType,
  isTradeDocumentTypeId,
  parseExtractedDocument,
} from "../../../../../libs/trade-documents";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(
  req: NextRequest,
  { params }: { params: { requestId: string } }
) {
  const apiKey = process.env.DATALAB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Document extraction is not configured" },
      { status: 500 }
    );
  }

  const requestId = params.requestId;
  if (!isDatalabRequestId(requestId)) {
    return NextResponse.json({ error: "Invalid request id" }, { status: 400 });
  }

  const documentTypeRaw = req.nextUrl.searchParams.get("documentType");
  if (!isTradeDocumentTypeId(documentTypeRaw)) {
    return NextResponse.json(
      { error: "Select a document type" },
      { status: 400 }
    );
  }
  const documentType = getTradeDocumentType(documentTypeRaw);

  try {
    const response = await fetch(datalabExtractCheckUrl(requestId), {
      headers: { "X-API-Key": apiKey },
      cache: "no-store",
    });
    const body = (await response.json().catch(() => null)) as Record<
      string,
      unknown
    > | null;

    if (!response.ok) {
      return NextResponse.json(
        {
          status: "failed",
          error: datalabErrorMessage(
            body,
            `Datalab poll failed (${response.status})`
          ),
        },
        { status: 502 }
      );
    }

    if (!body) {
      return NextResponse.json(
        { status: "failed", error: "Datalab poll returned an empty response" },
        { status: 502 }
      );
    }

    if (body.success === false || body.status === "failed") {
      return NextResponse.json({
        status: "failed",
        error: datalabErrorMessage(body, "Extraction failed"),
      });
    }

    if (body.status !== "complete") {
      return NextResponse.json({ status: "processing" });
    }

    const extracted = parseExtraction(body);
    if (extracted == null) {
      return NextResponse.json({ status: "processing" });
    }

    const { header, lineItems } = parseExtractedDocument(
      documentType,
      extracted
    );

    return NextResponse.json({
      status: "complete",
      documentType: documentType.id,
      header,
      lineItems,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to check extraction status";
    console.error("doc-to-csv extract poll error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
