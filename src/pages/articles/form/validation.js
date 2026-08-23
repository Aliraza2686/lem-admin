// Mirrors lem-backend/middlewheres/articleValidators.js.
export function validateArticle(values, { isEdit }) {
  const errors = {};

  if (!values.title?.trim()) errors.title = "Title is required";
  else if (values.title.length > 200) errors.title = "Title must be 200 characters or fewer";

  const contentLength = (values.content || "").trim().length;
  if (contentLength < 50) errors.content = "Content must be at least 50 characters";

  if (values.excerpt && values.excerpt.length > 300) errors.excerpt = "Excerpt must be 300 characters or fewer";

  // requireCoverImageOnCreate: the server 400s a create request with no cover image at all.
  if (!isEdit && !values.coverImageFile && !values.existingCoverImage) {
    errors.coverImage = "Cover image is required";
  }

  return errors;
}

export const isValid = (errors) => Object.keys(errors).length === 0;
