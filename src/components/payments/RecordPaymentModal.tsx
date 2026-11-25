'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency } from '@/lib/utils';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useSchemeData } from '@/context/SchemeDataContext';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  preselectedCustomerId?: string;
  preselectedSchemeCardId?: string;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedCustomerId,
  preselectedSchemeCardId,
}) => {
  const { showToast } = useToast();
  const { customers, schemeCards, refreshAll } = useSchemeData();

  const [selectedCustomerId, setSelectedCustomerId] = useState(preselectedCustomerId || '');
  const [selectedCardId, setSelectedCardId] = useState(preselectedSchemeCardId || '');

  const [amount, setAmount] = useState<string>('500');
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Other'>('Cash');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize selected customer and card from cached data
  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (!selectedCustomerId && customers.length > 0) {
        setSelectedCustomerId(preselectedCustomerId || customers[0]._id);
      }
    }
  }, [isOpen, preselectedCustomerId, selectedCustomerId, customers]);

  // Sync preselected props when changed
  useEffect(() => {
    if (preselectedCustomerId) {
      setSelectedCustomerId(preselectedCustomerId);
    }
  }, [preselectedCustomerId]);

  useEffect(() => {
    if (preselectedSchemeCardId) {
      setSelectedCardId(preselectedSchemeCardId);
    }
  }, [preselectedSchemeCardId]);

  // Filter cards for selected customer
  const customerCards = schemeCards.filter((c) => c.customerId === selectedCustomerId);

  useEffect(() => {
    if (customerCards.length > 0) {
      if (!selectedCardId || !customerCards.some((c) => c._id === selectedCardId)) {
        setSelectedCardId(customerCards[0]._id);
        setAmount(String(customerCards[0].monthlyInstallment || 500));
      }
    } else {
      setSelectedCardId('');
    }
  }, [selectedCustomerId, customerCards, selectedCardId]);

  const activeCard = schemeCards.find((c) => c._id === selectedCardId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedCustomerId) {
      setError('Please select a customer.');
      return;
    }

    if (!selectedCardId) {
      setError('Please select a scheme card.');
      return;
    }

    const payAmount = Number(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      setError('Please enter a valid payment amount greater than zero.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          schemeCardId: selectedCardId,
          amount: payAmount,
          paymentDate: new Date(paymentDate).toISOString(),
          paymentMethod,
          notes,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Unable to record payment. Please try again.');
      }

      showToast(json.message || `Payment of ₹${payAmount} recorded successfully!`, 'success');
      await refreshAll();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Unable to record payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Scheme Payment"
      description="Record customer installment payment with automatic schedule allocation."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-md">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Customer Select */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Customer</label>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:border-slate-800 focus:outline-none"
          >
            <option value="">Select customer...</option>
            {customers.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.phone})
              </option>
            ))}
          </select>
        </div>

        {/* Scheme Card Select */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Scheme Card</label>
          <select
            value={selectedCardId}
            onChange={(e) => {
              setSelectedCardId(e.target.value);
              const card = schemeCards.find((c) => c._id === e.target.value);
              if (card) {
                setAmount(String(card.monthlyInstallment || 500));
              }
            }}
            disabled={customerCards.length === 0}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:border-slate-800 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
          >
            {customerCards.length === 0 ? (
              <option value="">No scheme cards for this customer</option>
            ) : (
              customerCards.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.cardNumber} &bull; {c.schemeName} ({formatCurrency(c.monthlyInstallment)}/mo)
                </option>
              ))
            )}
          </select>
        </div>

        {/* Card Summary Box */}
        {activeCard && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Monthly Installment:</span>
              <span className="font-semibold text-slate-900">{formatCurrency(activeCard.monthlyInstallment)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Total Scheme Value:</span>
              <span className="font-medium text-slate-800">{formatCurrency(activeCard.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Paid So Far:</span>
              <span className="font-medium text-emerald-700">{formatCurrency(activeCard.totalPaid || 0)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Remaining Balance:</span>
              <span className="font-medium text-slate-900">{formatCurrency(activeCard.remainingAmount || 0)}</span>
            </div>
          </div>
        )}

        {/* Payment Amount & Date */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Payment Amount (₹)"
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="500"
            required
          />

          <Input
            label="Payment Date"
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            required
          />
        </div>

        {/* Quick Amount Suggestion Buttons */}
        {activeCard && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Quick:</span>
            <button
              type="button"
              onClick={() => setAmount(String(activeCard.monthlyInstallment))}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
            >
              1 Mo ({formatCurrency(activeCard.monthlyInstallment)})
            </button>
            <button
              type="button"
              onClick={() => setAmount(String(activeCard.monthlyInstallment * 2))}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
            >
              2 Mo ({formatCurrency(activeCard.monthlyInstallment * 2)})
            </button>
            <button
              type="button"
              onClick={() => setAmount(String(activeCard.monthlyInstallment * 3))}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
            >
              3 Mo ({formatCurrency(activeCard.monthlyInstallment * 3)})
            </button>
          </div>
        )}

        {/* Payment Method */}
        <Select
          label="Payment Method"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value as any)}
        >
          <option value="Cash">Cash</option>
          <option value="UPI">UPI / QR Code</option>
          <option value="Other">Other / Cheque / Card</option>
        </Select>

        {/* Notes */}
        <Input
          label="Note (Optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Receipt #124 or reference"
        />

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            <CheckCircle2 className="w-4 h-4" />
            <span>Record Payment</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
