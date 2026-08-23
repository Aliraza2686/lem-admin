// Mirrors lem-backend/middlewheres/productValidators.js exactly.
const SLUG_PATTERN = /^[a-z0-9-]+$/;

export function validateProduct(values) {
  const errors = {};

  if (!values.id?.trim()) errors.id = "Product id is required";
  else if (!SLUG_PATTERN.test(values.id.trim()))
    errors.id = "id must be lowercase letters, numbers, and hyphens only";

  if (!values.name?.trim()) errors.name = "Name is required";
  else if (values.name.length > 200) errors.name = "Name must be 200 characters or fewer";

  if (values.category && values.category.length > 100) errors.category = "Category must be 100 characters or fewer";
  if (values.origin && values.origin.length > 200) errors.origin = "Origin must be 200 characters or fewer";
  if (values.desc && values.desc.length > 5000) errors.desc = "Description must be 5000 characters or fewer";
  if (values.heroNote && values.heroNote.length > 300) errors.heroNote = "Hero note must be 300 characters or fewer";

  const variantErrors = [];
  (values.variants || []).forEach((v, i) => {
    if (!v.key?.trim()) variantErrors[i] = "Variant key is required";
  });
  if (variantErrors.length) errors.variants = variantErrors;

  // Duplicate variant keys would break the /variants/:variantKey/images route (ambiguous target).
  const keys = (values.variants || []).map((v) => v.key?.trim()).filter(Boolean);
  const dupes = keys.filter((k, i) => keys.indexOf(k) !== i);
  if (dupes.length) errors.variantsDuplicate = `Duplicate variant key(s): ${[...new Set(dupes)].join(", ")}`;

  return errors;
}

export const isValid = (errors) => Object.keys(errors).length === 0;
