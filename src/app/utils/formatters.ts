import { ProductAttributeValue } from "@/app/types/product";

/**
 * Format product attribute values for display in table cells
 */
export function formatValue(value: ProductAttributeValue): string {
  if (value === null || value === undefined) {
    return "-";
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (typeof value === "object") {
    // Handle measure/price objects with value and unit
    if ("value" in value && "unit" in value) {
      return `${value.value} ${value.unit}`;
    }

    // Handle other objects
    return JSON.stringify(value);
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
}

/**
 * Format dates for display
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
