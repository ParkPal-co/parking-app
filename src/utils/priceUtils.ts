export function validatePrice(price: string | number): string | null {
  const value = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(value) || value <= 0) {
    return 'Price must be greater than 0';
  }
  return null;
} 