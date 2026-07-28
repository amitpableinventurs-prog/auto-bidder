import dayjs from 'dayjs';

/**
 * Safely formats a number as currency (INR)
 * Prevents crashes if value is null, undefined, or NaN
 */
export const formatCurrency = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined) return '₹ 0';

  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) return '₹ 0';

  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  } catch (e) {
    // Fallback if Intl is not available
    return `₹ ${num.toLocaleString('en-IN')}`;
  }
};

/**
 * Safely formats a date string
 * Prevents crashes if date is invalid
 */
export const formatDate = (date: string | Date | null | undefined, format: string = 'DD MMM YYYY'): string => {
  if (!date) return 'N/A';

  const d = dayjs(date);
  if (!d.isValid()) return 'Invalid Date';

  return d.format(format);
};

/**
 * Safely access nested properties
 */
export const safeGet = <T>(fn: () => T, defaultValue: T): T => {
  try {
    const value = fn();
    return value === undefined || value === null ? defaultValue : value;
  } catch (e) {
    return defaultValue;
  }
};
