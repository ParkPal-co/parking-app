export function validateAvailabilityDates(availableFrom: string, availableTo: string): string | null {
  const now = new Date();
  const from = new Date(availableFrom);
  const to = new Date(availableTo);

  if (from < now) {
    return 'Available from date cannot be in the past';
  }
  if (to <= from) {
    return 'Available to date must be after available from date';
  }
  return null;
} 