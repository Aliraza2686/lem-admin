import { describe, it, expect } from "vitest";
import { slugifyPreview, estimateWordCount, estimateReadTime } from "../articleUtils.js";

describe("slugifyPreview", () => {
  it("mirrors the server's slugify(title, {lower:true, strict:true}) closely enough to preview", () => {
    expect(slugifyPreview("How Bentonite is Used in Piling and Construction")).toBe(
      "how-bentonite-is-used-in-piling-and-construction"
    );
  });

  it("strips punctuation and collapses whitespace/hyphens", () => {
    expect(slugifyPreview("What's New? — 2026 Update!!")).toBe("whats-new-2026-update");
  });

  it("trims leading/trailing hyphens", () => {
    expect(slugifyPreview("  -Leading and trailing-  ")).toBe("leading-and-trailing");
  });
});

describe("estimateWordCount / estimateReadTime — mirrors Article.js pre('save') hook", () => {
  it("strips HTML tags before counting words", () => {
    expect(estimateWordCount("<h2>Title</h2><p>One two three four five</p>")).toBe(6);
  });

  it("returns 0 words for empty content", () => {
    expect(estimateWordCount("")).toBe(0);
    expect(estimateWordCount("<p></p>")).toBe(0);
  });

  it("computes read time as ceil(words/200), minimum 1 — matches Math.max(1, Math.ceil(words/200))", () => {
    expect(estimateReadTime("word ".repeat(10))).toBe(1);
    expect(estimateReadTime("word ".repeat(250))).toBe(2);
    expect(estimateReadTime("word ".repeat(401))).toBe(3);
  });
});
