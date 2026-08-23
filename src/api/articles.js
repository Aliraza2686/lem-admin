import { instance } from "../axios/instance";
import api from "../api";

// Real Article API (lem-backend/routes/articleRoutes.js). Unlike Products, article
// images travel IN the same multipart request as the text fields — there is no
// separate image-upload sub-route, and no per-image delete route either. Server
// ALLOWED_FIELDS: title, excerpt, content, category, status, isFeatured, tags,
// metaTitle, metaDescription, keywords. Read-only: _id, slug, author, wordCount,
// readTime, views, likes, publishedAt, createdAt, updatedAt.
//
// Gallery semantics (server-enforced, not a client choice): omitting `gallery`
// files on PUT leaves the existing gallery untouched; including ANY gallery files
// wholesale-replaces the entire existing gallery (old Cloudinary assets deleted).
// There is no way to add/remove/reorder a single gallery image independently.

export const listArticles = (params = {}) => instance({ url: "/articles", method: "GET", params });

export const getArticleBySlug = (slug) => instance({ url: `/articles/${slug}`, method: "GET" });

// Builds the multipart FormData payload shared by create/update. Exported and pure
// (no I/O) so it's unit-testable without mocking network or rendering anything.
export const buildArticleFormData = (values) => {
  const fd = new FormData();

  const setIfDefined = (key, val) => {
    if (val !== undefined && val !== null) fd.append(key, val);
  };

  setIfDefined("title", values.title?.trim());
  setIfDefined("excerpt", values.excerpt || "");
  setIfDefined("content", values.content || "");
  setIfDefined("category", values.category || "");
  setIfDefined("status", values.status || "draft");
  fd.append("isFeatured", values.isFeatured ? "true" : "false");
  fd.append("tags", (values.tags || []).filter(Boolean).join(","));
  setIfDefined("metaTitle", values.seo?.metaTitle || "");
  setIfDefined("metaDescription", values.seo?.metaDescription || "");
  fd.append("keywords", (values.seo?.keywords || []).filter(Boolean).join(","));

  if (values.coverImageFile) {
    fd.append("coverImage", values.coverImageFile);
  }
  if (values.galleryFiles?.length) {
    values.galleryFiles.forEach((file) => fd.append("gallery", file));
  }

  return fd;
};

export const createArticle = (values, onProgress) =>
  api
    .post("/articles", buildArticleFormData(values), {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (evt) => {
        if (onProgress && evt.total) onProgress(Math.round((evt.loaded * 100) / evt.total));
      },
    })
    .then((res) => ({ success: true, data: res.data, status: res.status }))
    .catch((error) => ({
      success: false,
      status: error?.response?.status,
      message: error?.response?.data?.message || error.message || "Something went wrong",
      error: error?.response?.data || null,
    }));

export const updateArticle = (id, values, onProgress) =>
  api
    .put(`/articles/${id}`, buildArticleFormData(values), {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (evt) => {
        if (onProgress && evt.total) onProgress(Math.round((evt.loaded * 100) / evt.total));
      },
    })
    .then((res) => ({ success: true, data: res.data, status: res.status }))
    .catch((error) => ({
      success: false,
      status: error?.response?.status,
      message: error?.response?.data?.message || error.message || "Something went wrong",
      error: error?.response?.data || null,
    }));

export const deleteArticle = (id) => instance({ url: `/articles/${id}`, method: "DELETE" });

export const likeArticle = (id) => instance({ url: `/articles/${id}/like`, method: "PATCH" });

// Convenience wrapper — status-only transition via the same multipart PUT (no
// dedicated publish endpoint exists server-side).
export const setArticleStatus = (id, status) => {
  const fd = new FormData();
  fd.append("status", status);
  return api
    .put(`/articles/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } })
    .then((res) => ({ success: true, data: res.data, status: res.status }))
    .catch((error) => ({
      success: false,
      status: error?.response?.status,
      message: error?.response?.data?.message || error.message || "Something went wrong",
      error: error?.response?.data || null,
    }));
};
