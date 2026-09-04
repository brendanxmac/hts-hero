export const DATALAB_EXTRACT_URL = "https://www.datalab.to/api/v1/extract";

export function isDatalabRequestId(value: string): boolean {
  return /^[A-Za-z0-9._-]{8,128}$/.test(value);
}

export function datalabExtractCheckUrl(requestId: string): string {
  return `${DATALAB_EXTRACT_URL}/${encodeURIComponent(requestId)}`;
}

export function datalabErrorMessage(body: unknown, fallback: string): string {
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

export function parseExtraction(result: Record<string, unknown>): unknown | null {
  const raw = result.extraction_schema_json;
  if (raw == null) {
    return null;
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
