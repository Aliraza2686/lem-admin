import { instance } from "../axios/instance";
import api from "../api";

// Certification API (lem-backend/routes/certificationRoutes.js). Create/update are a
// single multipart request: title, description and one `file` field. fileUrl,
// filePublicId and fileType are server-derived (fileType from the upload's mimetype).
// On PUT, omitting `file` keeps the current asset; sending one replaces it and the
// server deletes the old Cloudinary asset after the new one saves.

export const listCertifications = () => instance({ url: "/certifications", method: "GET" });

export const buildCertificationFormData = (values) => {
  const fd = new FormData();
  fd.append("title", values.title?.trim() || "");
  fd.append("description", values.description?.trim() || "");
  if (values.file) fd.append("file", values.file);
  return fd;
};

const sendMultipart = (method, url, values, onProgress) =>
  api
    .request({
      method,
      url,
      data: buildCertificationFormData(values),
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

export const createCertification = (values, onProgress) => sendMultipart("post", "/certifications", values, onProgress);

export const updateCertification = (id, values, onProgress) =>
  sendMultipart("put", `/certifications/${id}`, values, onProgress);

export const deleteCertification = (id) => instance({ url: `/certifications/${id}`, method: "DELETE" });
