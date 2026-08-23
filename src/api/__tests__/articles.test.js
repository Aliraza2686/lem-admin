import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock both the raw axios instance (`api`) and the generic `instance()` wrapper
// so these tests exercise only our own request-shaping code, never real network.
const apiMock = { post: vi.fn(), put: vi.fn() };
vi.mock("../../api", () => ({ default: apiMock }));

const instanceMock = vi.fn();
vi.mock("../../axios/instance", () => ({ instance: instanceMock }));

const { buildArticleFormData, createArticle, updateArticle, deleteArticle, setArticleStatus } = await import(
  "../articles.js"
);

describe("buildArticleFormData", () => {
  it("sends the exact allowed fields the server accepts, comma-joined for arrays", () => {
    const fd = buildArticleFormData({
      title: "  Test Title  ",
      excerpt: "An excerpt",
      content: "<p>Some content</p>",
      category: "Construction Materials",
      status: "published",
      isFeatured: true,
      tags: ["bentonite", "piling", ""],
      seo: { metaTitle: "Meta title", metaDescription: "Meta desc", keywords: ["a", "b"] },
    });

    expect(fd.get("title")).toBe("Test Title"); // trimmed
    expect(fd.get("excerpt")).toBe("An excerpt");
    expect(fd.get("content")).toBe("<p>Some content</p>");
    expect(fd.get("category")).toBe("Construction Materials");
    expect(fd.get("status")).toBe("published");
    expect(fd.get("isFeatured")).toBe("true");
    expect(fd.get("tags")).toBe("bentonite,piling"); // empty entries dropped
    expect(fd.get("metaTitle")).toBe("Meta title");
    expect(fd.get("metaDescription")).toBe("Meta desc");
    expect(fd.get("keywords")).toBe("a,b");
  });

  it("defaults status to draft and isFeatured to false when omitted", () => {
    const fd = buildArticleFormData({ title: "T", content: "c".repeat(60) });
    expect(fd.get("status")).toBe("draft");
    expect(fd.get("isFeatured")).toBe("false");
  });

  it("omits coverImage/gallery entirely when no files are staged (server-side: leaves existing assets untouched)", () => {
    const fd = buildArticleFormData({ title: "T", content: "c".repeat(60) });
    expect(fd.get("coverImage")).toBeNull();
    expect(fd.getAll("gallery")).toEqual([]);
  });

  it("appends coverImage only when a file is staged — this is what triggers the server's replace+cleanup path", () => {
    const file = new File(["x"], "cover.jpg", { type: "image/jpeg" });
    const fd = buildArticleFormData({ title: "T", content: "c".repeat(60), coverImageFile: file });
    expect(fd.get("coverImage")).toBe(file);
  });

  it("appends every staged gallery file — any non-empty gallery selection replaces the whole server-side gallery", () => {
    const files = [
      new File(["a"], "1.jpg", { type: "image/jpeg" }),
      new File(["b"], "2.jpg", { type: "image/jpeg" }),
    ];
    const fd = buildArticleFormData({ title: "T", content: "c".repeat(60), galleryFiles: files });
    expect(fd.getAll("gallery")).toEqual(files);
  });
});

describe("createArticle / updateArticle — request shape", () => {
  beforeEach(() => {
    apiMock.post.mockReset().mockResolvedValue({ data: { success: true }, status: 201 });
    apiMock.put.mockReset().mockResolvedValue({ data: { success: true }, status: 200 });
  });

  it("createArticle POSTs multipart/form-data to /articles", async () => {
    await createArticle({ title: "T", content: "c".repeat(60) });
    expect(apiMock.post).toHaveBeenCalledTimes(1);
    const [url, body, config] = apiMock.post.mock.calls[0];
    expect(url).toBe("/articles");
    expect(body).toBeInstanceOf(FormData);
    expect(config.headers["Content-Type"]).toBe("multipart/form-data");
  });

  it("updateArticle PUTs multipart/form-data to /articles/:id", async () => {
    await updateArticle("abc123", { title: "T", content: "c".repeat(60) });
    expect(apiMock.put).toHaveBeenCalledTimes(1);
    const [url, body] = apiMock.put.mock.calls[0];
    expect(url).toBe("/articles/abc123");
    expect(body).toBeInstanceOf(FormData);
  });

  it("surfaces a failed create as success:false with the server message", async () => {
    apiMock.post.mockRejectedValueOnce({ response: { status: 400, data: { message: "content must be at least 50 characters" } } });
    const res = await createArticle({ title: "T", content: "short" });
    expect(res.success).toBe(false);
    expect(res.status).toBe(400);
    expect(res.message).toMatch(/50 characters/);
  });
});

describe("deleteArticle — cascades to the real DELETE route", () => {
  beforeEach(() => instanceMock.mockReset().mockResolvedValue({ success: true }));

  it("calls DELETE /articles/:id, which is what triggers server-side Cloudinary cleanup", async () => {
    await deleteArticle("abc123");
    expect(instanceMock).toHaveBeenCalledWith({ url: "/articles/abc123", method: "DELETE" });
  });
});

describe("setArticleStatus — publish/unpublish/archive transitions", () => {
  beforeEach(() => {
    apiMock.put.mockReset().mockResolvedValue({ data: { success: true, article: { status: "published" } }, status: 200 });
  });

  it("PUTs only the status field for a publish transition", async () => {
    await setArticleStatus("abc123", "published");
    const [url, body] = apiMock.put.mock.calls[0];
    expect(url).toBe("/articles/abc123");
    expect(body.get("status")).toBe("published");
    // Nothing else should be sent — a status-only transition must not
    // accidentally blank out title/content/etc on the server.
    expect([...body.keys()]).toEqual(["status"]);
  });

  it.each(["draft", "published", "archived"])("accepts the %s status value", async (status) => {
    await setArticleStatus("abc123", status);
    const body = apiMock.put.mock.calls.at(-1)[1];
    expect(body.get("status")).toBe(status);
  });
});
