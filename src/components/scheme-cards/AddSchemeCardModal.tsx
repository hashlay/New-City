'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { Customer } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';
import { useSchemeData } from '@/context/SchemeDataContext';

interface AddSchemeCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  preselectedCustomerId?: string;
}

export const AddSchemeCardModal: React.FC<AddSchemeCardModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedCustomerId,
}) => {
  const { showToast } = useToast();
  const { customers: cachedCustomers, schemeCards: cachedCards, refreshAll } = useSchemeData();

  const [customerId, setCustomerId] = useState(preselectedCustomerId || '');
  const [schemeName, setSchemeName] = useState('New City Scheme');
  const [cardNumber, setCardNumber] = useState('');
  const [monthlyInstallment, setMonthlyInstallment] = useState('500');
  const [totalInstallments, setTotalInstallments] = useState('20');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (!customerId && cachedCustomers.length > 0) {
        setCustomerId(preselectedCustomerId || cachedCustomers[0]._id);
      }
      const nextNum = 1000 + cachedCards.length + 1;
      setCardNumber(`NC-${nextNum}`);
    }
  }, [isOpen, preselectedCustomerId, customerId, cachedCustomers, cachedCards]);

  useEffect(() => {
    if (preselectedCustomerId) {
      setCustomerId(preselectedCustomerId);
    }
  }, [preselectedCustomerId]);

  const totalValue = (Number(monthlyInstallment) || 0) * (Number(totalInstallments) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerId) {
      setError('Please select a customer.');
      return;
    }

    if (!cardNumber.trim()) {
      setError('Card number is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/scheme-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          schemeName: schemeName || 'New City Scheme',
          cardNumber: cardNumber.trim().toUpperCase(),
          monthlyInstallment: Number(monthlyInstallment),
          totalInstallments: Number(totalInstallments),
          totalAmount: totalValue,
          startDate: new Date(startDate).toISOString(),
          status,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Scheme card creation failed.');
      }

      showToast(`Scheme Card ${cardNumber.toUpperCase()} created with 20 installments schedule!`, 'success');
      await refreshAll();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create scheme card.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Scheme Card"
      description="Issue a new scheme card under New City Scheme with monthly installment schedule."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-md">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Select Customer</label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:border-slate-800 focus:outline-none"
            required
          >
            <option value="">Select customer...</option>
            {cachedCustomers.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.phone})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Scheme Name"
            value={schemeName}
            onChange={(e) => setSchemeName(e.target.value)}
            required
          />

          <Input
            label="Card Number"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            placeholder="NC-1001"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Monthly Installment (₹)"
            type="number"
            min="100"
            value={monthlyInstallment}
            onChange={(e) => setMonthlyInstallment(e.target.value)}
            required
          />

          <Input
            label="Total Installments"
            type="number"
            min="1"
            max="60"
            value={totalInstallments}
            onChange={(e) => setTotalInstallments(e.target.value)}
            required
          />
        </div>

        {/* Calculated Scheme Value banner */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium">Total Scheme Value:</span>
          <span className="font-semibold text-slate-900 text-sm">{formatCurrency(totalValue)}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Scheme Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />

          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </Select>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Create Scheme Card
          </Button>
        </div>
      </form>
    </Modal>
  );
};
