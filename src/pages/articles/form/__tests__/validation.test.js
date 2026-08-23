import { describe, it, expect } from "vitest";
import { validateArticle, isValid } from "../validation.js";

const base = { title: "A valid title", content: "x".repeat(60) };

describe("validateArticle — mirrors lem-backend/middlewheres/articleValidators.js", () => {
  it("passes with the minimum required fields", () => {
    const errors = validateArticle({ ...base, coverImageFile: null, existingCoverImage: "https://x" }, { isEdit: true });
    expect(isValid(errors)).toBe(true);
  });

  it("requires a title", () => {
    const errors = validateArticle({ ...base, title: "" }, { isEdit: true });
    expect(errors.title).toBeTruthy();
  });

  it("rejects a title over 200 characters", () => {
    const errors = validateArticle({ ...base, title: "a".repeat(201) }, { isEdit: true });
    expect(errors.title).toBeTruthy();
  });

  it("requires content to be at least 50 characters, matching the server's isLength({min:50})", () => {
    const short = validateArticle({ ...base, content: "too short" }, { isEdit: true });
    expect(short.content).toBeTruthy();

    const exact = validateArticle({ ...base, content: "x".repeat(50) }, { isEdit: true });
    expect(exact.content).toBeUndefined();
  });

  it("rejects an excerpt over 300 characters", () => {
    const errors = validateArticle({ ...base, excerpt: "a".repeat(301) }, { isEdit: true });
    expect(errors.excerpt).toBeTruthy();
  });

  it("requires a cover image on create (server: requireCoverImageOnCreate) but not on edit", () => {
    const onCreate = validateArticle({ ...base }, { isEdit: false });
    expect(onCreate.coverImage).toBeTruthy();

    const onCreateWithFile = validateArticle({ ...base, coverImageFile: {} }, { isEdit: false });
    expect(onCreateWithFile.coverImage).toBeUndefined();

    const onEditWithoutFile = validateArticle({ ...base }, { isEdit: true });
    expect(onEditWithoutFile.coverImage).toBeUndefined();
  });
});
