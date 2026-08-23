import { instance } from "../axios/instance";
import api from "../api";

// Thin wrapper around the real Product API (see lem-backend/routes/productRoutes.js).
// Server accepts/returns exactly: id, name, category, origin, desc, heroNote,
// applications[], packaging[], variants[{key,label,swatch,desc,purity,quality,highlights[],images[{src,publicId,is_video}]}],
// labReports[{name,file,size}]. No price/stock/status/tags fields exist server-side.

export const listProducts = (params = {}) =>
  instance({ url: "/products", method: "GET", params });

export const getProduct = (id) =>
  instance({ url: `/products/${id}`, method: "GET" });

export const createProduct = (data) =>
  instance({ url: "/products", method: "POST", data });

export const updateProduct = (id, data) =>
  instance({ url: `/products/${id}`, method: "PUT", data });

export const deleteProduct = (id) =>
  instance({ url: `/products/${id}`, method: "DELETE" });

// Multipart upload — goes straight through axios (not the JSON `instance` wrapper)
// so we can send FormData and track upload progress per file.
export const uploadVariantImages = (id, variantKey, files, onProgress) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));

  return api
    .post(`/products/${id}/variants/${variantKey}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (evt) => {
        if (onProgress && evt.total) {
          onProgress(Math.round((evt.loaded * 100) / evt.total));
        }
      },
    })
    .then((res) => ({ success: true, data: res.data, status: res.status }))
    .catch((error) => ({
      success: false,
      status: error?.response?.status,
      message: error?.response?.data?.message || error.message || "Upload failed",
      error: error?.response?.data || null,
    }));
};

export const deleteVariantImage = (id, variantKey, publicId) =>
  instance({
    url: `/products/${id}/variants/${variantKey}/images`,
    method: "DELETE",
    data: { publicId },
  });
