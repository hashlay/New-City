import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number as Indian Rupee (₹)
 */
export function formatCurrency(amount: number | undefined | null, currency = '₹'): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return `${currency}0`;
  }
  return `${currency}${amount.toLocaleString('en-IN')}`;
}

/**
 * Format ISO date string into readable format (e.g., "15 Oct 2026")
 */
export function formatDate(dateStr: string | Date | undefined | null): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '-';
  }
}

/**
 * Returns clean minimal styling for installment and card statuses
 */
export function getStatusBadgeVariant(status: string): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (status) {
    case 'Paid':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
      };
    case 'Advance':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-blue-500',
      };
    case 'Overdue':
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        dot: 'bg-rose-500',
      };
    case 'Partially Paid':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
      };
    case 'Active':
      return {
        bg: 'bg-slate-100',
        text: 'text-slate-800',
        border: 'border-slate-300',
        dot: 'bg-slate-600',
      };
    case 'Completed':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
      };
    case 'Upcoming':
      return {
        bg: 'bg-sky-50',
        text: 'text-sky-700',
        border: 'border-sky-200',
        dot: 'bg-sky-500',
      };
    case 'Inactive':
    case 'Pending':
    default:
      return {
        bg: 'bg-slate-50',
        text: 'text-slate-600',
        border: 'border-slate-200',
        dot: 'bg-slate-400',
      };
  }
}

