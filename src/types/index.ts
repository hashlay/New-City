export type InstallmentStatus = 'Paid' | 'Pending' | 'Overdue' | 'Advance' | 'Partially Paid';
export type SchemeStatus = 'Active' | 'Completed' | 'Inactive';
export type PaymentMethod = 'Cash' | 'UPI' | 'Other';
export type DrawStatus = 'Upcoming' | 'Completed';

export interface Customer {
  _id: string;
  name: string;
  phone: string;
  address?: string;
  createdAt: string;
  notes?: string;
}

export interface SchemeCard {
  _id: string;
  customerId: string;
  schemeName: string;
  cardNumber: string;
  monthlyInstallment: number;
  totalInstallments: number;
  totalAmount: number;
  startDate: string;
  status: SchemeStatus;
  createdAt: string;
  // Computed fields populated when fetching
  customer?: Customer;
  totalPaid?: number;
  remainingAmount?: number;
  pendingInstallmentsCount?: number;
  advanceInstallmentsCount?: number;
  paidInstallmentsCount?: number;
  nextPaymentDue?: string | null;
}

export interface Installment {
  _id: string;
  schemeCardId: string;
  installmentNumber: number;
  dueDate: string;
  dueAmount: number;
  paidAmount: number;
  status: InstallmentStatus;
  paidDate?: string | null;
}

export interface Payment {
  _id: string;
  customerId: string;
  schemeCardId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
  // Populated fields
  customer?: Customer;
  schemeCard?: SchemeCard;
  installmentsCovered?: number[];
  allocations?: PaymentAllocation[];
}

export interface PaymentAllocation {
  _id: string;
  paymentId: string;
  schemeCardId: string;
  installmentId: string;
  installmentNumber: number;
  amount: number;
  allocatedDate: string;
}

export interface Draw {
  _id: string;
  drawNumber: number;
  drawDate: string;
  grandPrize: string;
  additionalPrizes: string[];
  status: DrawStatus;
  notes?: string;
  winners?: Winner[];
}

export interface Winner {
  _id: string;
  drawId: string;
  customerId: string;
  schemeCardId: string;
  prize: string;
  winnerInformation?: string;
  wonDate: string;
  // Populated fields
  customer?: Customer;
  schemeCard?: SchemeCard;
  draw?: Draw;
}

export interface Settings {
  _id?: string;
  shopName: string;
  shopLogoUrl?: string;
  phone?: string;
  address?: string;
  currency: string;
  defaultSchemeName: string;
  defaultMonthlyInstallment: number;
  defaultTotalInstallments: number;
  defaultDurationMonths: number;
}

export interface DashboardStats {
  totalCustomers: number;
  activeSchemeCards: number;
  totalCollection: number;
  thisMonthCollection: number;
  pendingPaymentsAmount: number;
  pendingInstallmentsTotal: number;
}

export interface PaymentAllocationResult {
  installmentsToUpdate: Array<{
    installmentId: string;
    installmentNumber: number;
    newPaidAmount: number;
    newStatus: InstallmentStatus;
    allocatedAmount: number;
    isFullyPaidNow: boolean;
  }>;
  totalAllocated: number;
  remainingUnallocated: number;
  installmentsCoveredNumbers: number[];
}

