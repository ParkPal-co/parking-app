export function validateRequiredFields(obj: Record<string, any>, requiredFields: string[]): string | null {
  for (const field of requiredFields) {
    if (!obj[field] || (typeof obj[field] === 'string' && obj[field].trim() === '')) {
      return `Field '${field}' is required.`;
    }
  }
  return null;
} 