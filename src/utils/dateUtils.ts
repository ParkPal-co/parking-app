/**
 * src/utils/dateUtils.ts
 * Utility functions for handling dates in the application
 */

export function convertToDate(dateValue: any): Date {
  if (!dateValue) return new Date();
  if (typeof dateValue === "string") return new Date(dateValue);
  if (dateValue.toDate && typeof dateValue.toDate === "function")
    return dateValue.toDate();
  return new Date();
} 