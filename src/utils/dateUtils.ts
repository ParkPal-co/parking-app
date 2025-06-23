/**
 * src/utils/dateUtils.ts
 * Utility functions for handling dates in the application
 */

export function convertToDate(dateValue: string | Date | { toDate(): Date } | null | undefined): Date {
  if (!dateValue) return new Date();
  if (typeof dateValue === "string") return new Date(dateValue);
  if (dateValue instanceof Date) return dateValue;
  if (dateValue && typeof dateValue === "object" && "toDate" in dateValue && typeof dateValue.toDate === "function")
    return dateValue.toDate();
  return new Date();
} 