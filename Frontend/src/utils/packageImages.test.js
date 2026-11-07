import { describe, expect, it } from "vitest";
import { getPackageImageUrls } from "./packageImages";

describe("getPackageImageUrls", () => {
  it("uses modern image records and falls back to the legacy Image field without duplicates", () => {
    expect(getPackageImageUrls({
      Image: "https://example.test/first.jpg",
      images: [
        { id: 1, url: "https://example.test/first.jpg" },
        { id: 2, url: "https://example.test/second.jpg" },
      ],
    })).toEqual(["https://example.test/first.jpg", "https://example.test/second.jpg"]);

    expect(getPackageImageUrls({ Image: "https://example.test/legacy.jpg" })).toEqual([
      "https://example.test/legacy.jpg",
    ]);
  });
});