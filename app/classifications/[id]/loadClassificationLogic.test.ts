import { describe, it, expect } from "../../../testing/test-runner";
import { getClassificationLoadError } from "./loadClassificationLogic";

describe("getClassificationLoadError", () => {
  it("returns error when classification fetch fails", () => {
    expect(
      getClassificationLoadError(false, true)
    ).toBe("Classification not found");
    expect(
      getClassificationLoadError(false, false)
    ).toBe("Classification not found");
  });

  it("returns null when classification fetch succeeds (even if fetchElements fails)", () => {
    expect(
      getClassificationLoadError(true, false)
    ).toBe(null);
  });

  it("returns null when both fetches succeed", () => {
    expect(
      getClassificationLoadError(true, true)
    ).toBe(null);
  });
});
