import { Installment, InstallmentStatus, PaymentAllocationResult } from '@/types';

/**
 * Payment Allocation Engine
 *
 * Core Business Logic:
 * 1. Clear oldest pending / partially-paid installment.
 * 2. Clear current month's installment.
 * 3. Allocate remaining amount towards future installments (marked as Advance).
 *
 * Handles:
 * - Regular payments (e.g. ₹500)
 * - Two-month advance payments (e.g. ₹1,000)
 * - Missed payments (remain Pending/Overdue)
 * - Late payments (e.g. misses month 1, pays ₹1,000 in month 2 -> clears 1 and 2)
 * - Multiple advance payments (e.g. ₹1,500 pays 3 installments)
 * - Partial payments (e.g. ₹250 marks Partially Paid)
 */

export interface InstallmentAllocationTarget {
  _id: string;
  installmentNumber: number;
  dueDate: string;
  dueAmount: number;
  paidAmount: number;
  status: InstallmentStatus;
}

export function allocatePayment(
  installments: InstallmentAllocationTarget[],
  paymentAmount: number,
  paymentDateStr?: string
): PaymentAllocationResult {
  if (paymentAmount <= 0) {
    throw new Error('Payment amount must be greater than zero');
  }

  // Sort installments chronologically by installment number
  const sorted = [...installments].sort((a, b) => a.installmentNumber - b.installmentNumber);

  let remainingToAllocate = paymentAmount;
  const installmentsToUpdate: PaymentAllocationResult['installmentsToUpdate'] = [];
  const installmentsCoveredNumbers: number[] = [];

  const paymentDate = paymentDateStr ? new Date(paymentDateStr) : new Date();

  for (const inst of sorted) {
    if (remainingToAllocate <= 0) break;

    const remainingDue = inst.dueAmount - inst.paidAmount;
    if (remainingDue <= 0) {
      // Already fully paid, skip
      continue;
    }

    const dueDate = new Date(inst.dueDate);
    const amountForThis = Math.min(remainingToAllocate, remainingDue);
    const newPaidAmount = inst.paidAmount + amountForThis;
    const isFullyPaidNow = newPaidAmount >= inst.dueAmount;

    let newStatus: InstallmentStatus;

    if (isFullyPaidNow) {
      // Determine if paid in advance:
      // If payment is made before the scheduled due month/date
      if (paymentDate < dueDate) {
        newStatus = 'Advance';
      } else {
        newStatus = 'Paid';
      }
    } else {
      newStatus = 'Partially Paid';
    }

    installmentsToUpdate.push({
      installmentId: inst._id,
      installmentNumber: inst.installmentNumber,
      newPaidAmount,
      newStatus,
      allocatedAmount: amountForThis,
      isFullyPaidNow,
    });

    installmentsCoveredNumbers.push(inst.installmentNumber);
    remainingToAllocate -= amountForThis;
  }

  const totalAllocated = paymentAmount - remainingToAllocate;

  return {
    installmentsToUpdate,
    totalAllocated,
    remainingUnallocated: remainingToAllocate,
    installmentsCoveredNumbers,
  };
}

/**
 * Calculates pending amount for installments that are past due or currently due but not fully paid.
 */
export function calculatePendingAmount(installments: Installment[], referenceDate = new Date()): number {
  return installments.reduce((sum, inst) => {
    const dueDate = new Date(inst.dueDate);
    const isPastOrDue = dueDate <= referenceDate;
    if (isPastOrDue && inst.paidAmount < inst.dueAmount) {
      return sum + (inst.dueAmount - inst.paidAmount);
    }
    return sum;
  }, 0);
}

/**
 * Counts and returns information about advance installments (paid ahead of schedule).
 */
export function calculateAdvanceInstallments(installments: Installment[], referenceDate = new Date()): {
  count: number;
  totalAmount: number;
} {
  let count = 0;
  let totalAmount = 0;

  for (const inst of installments) {
    const dueDate = new Date(inst.dueDate);
    const isFuture = dueDate > referenceDate;

    if (inst.status === 'Advance' || (isFuture && inst.paidAmount > 0)) {
      count++;
      totalAmount += inst.paidAmount;
    }
  }

  return { count, totalAmount };
}

/**
 * Calculates total remaining balance for a scheme card.
 */
export function calculateRemainingBalance(totalSchemeAmount: number, totalPaid: number): number {
  return Math.max(0, totalSchemeAmount - totalPaid);
}

/**
 * Finds the next unpaid or partially paid installment.
 */
export function getNextDueInstallment(installments: Installment[]): Installment | null {
  const sorted = [...installments].sort((a, b) => a.installmentNumber - b.installmentNumber);
  return sorted.find((inst) => inst.paidAmount < inst.dueAmount) || null;
}

/**
 * Dynamically re-evaluates installment status based on current date
 * (e.g. marks an unpaid past-due installment as 'Overdue')
 */
export function normalizeInstallmentStatus(
  status: InstallmentStatus,
  paidAmount: number,
  dueAmount: number,
  dueDateStr: string,
  referenceDate = new Date()
): InstallmentStatus {
  if (paidAmount >= dueAmount) {
    return status === 'Advance' ? 'Advance' : 'Paid';
  }

  if (paidAmount > 0) {
    return 'Partially Paid';
  }

  const dueDate = new Date(dueDateStr);
  if (dueDate < referenceDate) {
    return 'Overdue';
  }

  return 'Pending';
}

/**
 * Generates an installment schedule when a new scheme card is created.
 */
export function generateInstallmentSchedule(
  schemeCardId: string,
  totalInstallments: number,
  monthlyInstallment: number,
  startDateStr: string
): Array<Omit<Installment, '_id'> & { _id?: string }> {
  const schedule: Array<Omit<Installment, '_id'>> = [];
  const start = new Date(startDateStr);

  for (let i = 1; i <= totalInstallments; i++) {
    const dueDate = new Date(start);
    // Add (i - 1) months to the start date
    dueDate.setMonth(dueDate.getMonth() + (i - 1));

    schedule.push({
      schemeCardId,
      installmentNumber: i,
      dueDate: dueDate.toISOString(),
      dueAmount: monthlyInstallment,
      paidAmount: 0,
      status: 'Pending',
      paidDate: null,
    });
  }

  return schedule;
}

