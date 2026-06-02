"use client";

type FieldErrors = Record<string, string>;

export function extractFieldErrors(error: unknown): FieldErrors {
  if (error && typeof error === "object" && "errors" in error) {
    const errs = (error as { errors?: { field: string; message: string }[] }).errors;
    if (errs && Array.isArray(errs) && errs.length > 0) {
      const map: FieldErrors = {};
      for (const e of errs) {
        map[e.field] = e.message;
      }
      return map;
    }
  }
  return {};
}

export function FieldError({ field, errors }: { field: string; errors?: FieldErrors | null }) {
  if (!errors?.[field]) return null;
  return (
    <p style={{ margin: "0.2rem 0 0", color: "#B91C1C", fontSize: 12 }}>{errors[field]}</p>
  );
}
