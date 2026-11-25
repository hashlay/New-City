'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import { RecordPaymentModal } from '@/components/payments/RecordPaymentModal';
import { useSchemeData } from '@/context/SchemeDataContext';

export default function PaymentsPage() {
  const { payments, refreshAll } = useSchemeData();
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<'ALL' | 'Cash' | 'UPI' | 'Other'>('ALL');

  // Modal
  const [isRecordPayOpen, setIsRecordPayOpen] = useState(false);

  // Instant in-memory search and filter
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (methodFilter !== 'ALL' && p.paymentMethod !== methodFilter) return false;
      if (!search || !search.trim()) return true;

      const q = search.toLowerCase().trim();
      const custName = p.customer?.name.toLowerCase() || '';
      const phone = p.customer?.phone.toLowerCase() || '';
      const cardNo = p.schemeCard?.cardNumber.toLowerCase() || '';
      return custName.includes(q) || phone.includes(q) || cardNo.includes(q);
    });
  }, [payments, methodFilter, search]);

  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Payment Records & Collections
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Audit trail of New City Scheme subscriber payments and automatic installment allocations.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsRecordPayOpen(true)}>
          <Receipt className="w-3.5 h-3.5" />
          <span>Record Payment</span>
        </Button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <span className="text-xs font-medium text-slate-500">Filtered Collection Total</span>
          <div className="mt-1 text-2xl font-bold text-slate-900">
            {formatCurrency(totalAmount)}
          </div>
          <span className="text-[11px] text-slate-400">{filteredPayments.length} transactions</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <span className="text-xs font-medium text-slate-500">Cash Received</span>
          <div className="mt-1 text-2xl font-bold text-slate-900">
            {formatCurrency(
              filteredPayments.filter((p) => p.paymentMethod === 'Cash').reduce((s, p) => s + p.amount, 0)
            )}
          </div>
          <span className="text-[11px] text-slate-400">Direct cash collections</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <span className="text-xs font-medium text-slate-500">UPI / Digital Received</span>
          <div className="mt-1 text-2xl font-bold text-slate-900">
            {formatCurrency(
              filteredPayments.filter((p) => p.paymentMethod === 'UPI').reduce((s, p) => s + p.amount, 0)
            )}
          </div>
          <span className="text-[11px] text-slate-400">Instant digital transfers</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer, phone, or scheme card..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 placeholder:text-slate-400"
          />
        </div>

        {/* Method filter buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-md text-xs font-medium text-slate-600 shrink-0">
          {(['ALL', 'Cash', 'UPI', 'Other'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMethodFilter(m)}
              className={`px-3 py-1 rounded transition-colors ${
                methodFilter === m
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Payments List Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Payment Date</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Scheme Card</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Installments Covered</th>
                <th className="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                    No payment records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-slate-600">
                      {formatDate(p.paymentDate)}
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-900">
                      <Link
                        href={`/contacts/${p.customerId}`}
                        className="hover:underline block"
                      >
                        {p.customer?.name || 'Customer'}
                      </Link>
                      <span className="text-xs text-slate-400 font-mono">
                        {p.customer?.phone || '-'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <Link
                        href={`/scheme-cards?search=${encodeURIComponent(p.schemeCard?.cardNumber || '')}`}
                        className="font-mono font-medium text-xs px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors inline-block"
                      >
                        {p.schemeCard?.cardNumber || 'Card'}
                      </Link>
                    </td>

                    <td className="py-3 px-4 font-bold text-emerald-700">
                      {formatCurrency(p.amount)}
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {p.paymentMethod}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {p.installmentsCovered && p.installmentsCovered.length > 0 ? (
                          p.installmentsCovered.map((num) => (
                            <span
                              key={num}
                              className="px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono font-medium"
                            >
                              Inst #{num}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-xs text-slate-500">
                      {p.notes || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isRecordPayOpen}
        onClose={() => setIsRecordPayOpen(false)}
        onSuccess={refreshAll}
      />
    </div>
  );
}
