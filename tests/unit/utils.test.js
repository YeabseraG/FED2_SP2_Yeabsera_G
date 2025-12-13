import { describe, it, expect } from "vitest";
import { getMediaUrl } from "../../js/utils.js";

describe("getMediaUrl", () => {
  it("returns placeholder if media is empty", () => {
    const url = getMediaUrl([]);
    expect(url).toContain("placeholder");
  });

  it("returns url from media object", () => {
    const url = getMediaUrl([{ url: "https://example.com/test.jpg" }]);
    expect(url).toBe("https://example.com/test.jpg");
  });
});
