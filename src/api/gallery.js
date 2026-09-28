import { instance } from "../axios/instance";
import api from "../api";

// Gallery API (lem-backend/routes/galleryRoutes.js). Create/update are a single multipart
// request: title, description and one `image` field. imageUrl/imagePublicId are
// server-derived. On PUT, omitting `image` keeps the current one; sending one replaces it
// and the server deletes the old Cloudinary asset after the new one saves (unless another
// gallery entry still uses it). New entries are appended to the end of the order.

export const listGallery = () => instance({ url: "/gallery", method: "GET" });

export const buildGalleryFormData = (values) => {
  const fd = new FormData();
  fd.append("title", values.title?.trim() || "");
  fd.append("description", values.description?.trim() || "");
  if (values.image) fd.append("image", values.image);
  return fd;
};

const sendMultipart = (method, url, values, onProgress) =>
  api
    .request({
      method,
      url,
      data: buildGalleryFormData(values),
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (evt) => {
        if (onProgress && evt.total) onProgress(Math.round((evt.loaded * 100) / evt.total));
      },
    })
    .then((res) => ({ success: true, data: res.data, status: res.status }))
    .catch((error) => ({
      success: false,
      status: error?.response?.status,
      message:
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0]?.msg ||
        error.message ||
        "Something went wrong",
      error: error?.response?.data || null,
    }));

export const createGalleryItem = (values, onProgress) => sendMultipart("post", "/gallery", values, onProgress);

export const updateGalleryItem = (id, values, onProgress) => sendMultipart("put", `/gallery/${id}`, values, onProgress);

export const deleteGalleryItem = (id) => instance({ url: `/gallery/${id}`, method: "DELETE" });

/** @param {{id: string, displayOrder: number}[]} items */
export const reorderGallery = (items) => instance({ url: "/gallery/reorder", method: "PATCH", data: { items } });
