import { describe, expect, it } from "../testing/test-runner";
import {
  isDatalabRequestId,
  parseExtraction,
} from "./datalab-extract";

describe("isDatalabRequestId", () => {
  it("accepts typical request ids", () => {
    expect(isDatalabRequestId("req_abc12345")).toBe(true);
    expect(isDatalabRequestId("a1b2c3d4-e5f6-7890-abcd-ef1234567890")).toBe(
      true
    );
  });

  it("rejects empty or unsafe ids", () => {
    expect(isDatalabRequestId("")).toBe(false);
    expect(isDatalabRequestId("../secret")).toBe(false);
    expect(isDatalabRequestId("short")).toBe(false);
  });
});

describe("parseExtraction", () => {
  it("returns null when Datalab has not attached data yet", () => {
    expect(parseExtraction({ status: "complete" })).toBe(null);
  });

  it("parses a JSON string payload", () => {
    const extracted = parseExtraction({
      extraction_schema_json: JSON.stringify({ invoice_number: "INV-1" }),
    }) as { invoice_number: string };
    expect(extracted.invoice_number).toBe("INV-1");
  });
});
