'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CreditCard,
  Phone,
  MapPin,
  Calendar,
  Receipt,
  Plus,
  Edit2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { Customer, SchemeCard, Payment, Installment } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { RecordPaymentModal } from '@/components/payments/RecordPaymentModal';
import { AddSchemeCardModal } from '@/components/scheme-cards/AddSchemeCardModal';
import { useSchemeData } from '@/context/SchemeDataContext';

export default function CustomerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { showToast } = useToast();
  const { customers: cachedCustomers, schemeCards: cachedCards, refreshAll } = useSchemeData();

  // Instant prefill from memory cache if available
  const existingCust = cachedCustomers.find((c) => c._id === id) || null;
  const existingCards = cachedCards.filter((c) => c.customerId === id);

  const [customer, setCustomer] = useState<Customer | null>(existingCust);
  const [schemeCards, setSchemeCards] = useState<SchemeCard[]>(existingCards);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(
    existingCards.length > 0 ? existingCards[0]._id : null
  );
  const [selectedCardDetails, setSelectedCardDetails] = useState<
    (SchemeCard & { installments?: Installment[]; payments?: Payment[] }) | null
  >(null);

  const [isLoading, setIsLoading] = useState(!existingCust);

  // Modals
  const [isRecordPayOpen, setIsRecordPayOpen] = useState(false);
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [isEditCustOpen, setIsEditCustOpen] = useState(false);

  // Edit fields
  const [editName, setEditName] = useState(existingCust?.name || '');
  const [editPhone, setEditPhone] = useState(existingCust?.phone || '');
  const [editAddress, setEditAddress] = useState(existingCust?.address || '');
  const [editNotes, setEditNotes] = useState(existingCust?.notes || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const loadCustomerData = useCallback(async () => {
    try {
      const [custRes, payRes] = await Promise.all([
        fetch(`/api/customers/${id}`),
        fetch(`/api/payments?customerId=${id}`),
      ]);

      const custJson = await custRes.json();
      const payJson = await payRes.json();

      if (custJson.success) {
        setCustomer(custJson.data);
        setEditName(custJson.data.name);
        setEditPhone(custJson.data.phone);
        setEditAddress(custJson.data.address || '');
        setEditNotes(custJson.data.notes || '');

        const cards = custJson.data.schemeCards || [];
        setSchemeCards(cards);
        if (cards.length > 0 && !selectedCardId) {
          setSelectedCardId(cards[0]._id);
        }
      }

      if (payJson.success) {
        setPayments(payJson.data);
      }
    } catch (err) {
      console.error('Failed to load customer profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id, selectedCardId]);

  useEffect(() => {
    loadCustomerData();
  }, [loadCustomerData]);

  // Load detailed card info (installments) when selected card changes
  useEffect(() => {
    if (selectedCardId) {
      fetch(`/api/scheme-cards/${selectedCardId}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success) {
            setSelectedCardDetails(json.data);
          }
        })
        .catch(console.error);
    }
  }, [selectedCardId]);

  const handleUpdateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          phone: editPhone.trim(),
          address: editAddress.trim(),
          notes: editNotes.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update');

      showToast('Customer information updated successfully!', 'success');
      setIsEditCustOpen(false);
      await refreshAll();
      loadCustomerData();
    } catch (err: any) {
      showToast(err.message || 'Error updating customer', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading && !customer) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading customer profile...</div>;
  }

  if (!customer) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm text-slate-600">Customer not found.</p>
        <Link href="/contacts" className="text-xs text-slate-900 underline font-medium">
          Back to Contacts
        </Link>
      </div>
    );
  }

  const totalSchemeValue = schemeCards.reduce((sum, c) => sum + c.totalAmount, 0);
  const totalAmountPaid = schemeCards.reduce((sum, c) => sum + (c.totalPaid || 0), 0);
  const totalRemaining = Math.max(0, totalSchemeValue - totalAmountPaid);
  const pendingInstallmentsCount = schemeCards.reduce(
    (sum, c) => sum + (c.pendingInstallmentsCount || 0),
    0
  );
  const advanceInstallmentsCount = schemeCards.reduce(
    (sum, c) => sum + (c.advanceInstallmentsCount || 0),
    0
  );
  const nextPaymentDue = schemeCards.find((c) => c.nextPaymentDue)?.nextPaymentDue;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Back button & Breadcrumb */}
      <div>
        <Link
          href="/contacts"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Contacts</span>
        </Link>
      </div>

      {/* Customer Header Card */}
      <div className="p-5 sm:p-6 bg-white border border-slate-200 rounded-lg shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                {customer.name}
              </h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {customer._id}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono">{customer.phone}</span>
              </div>
              {customer.address && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{customer.address}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Joined {formatDate(customer.createdAt)}</span>
              </div>
            </div>

            {customer.notes && (
              <p className="text-xs text-slate-500 italic mt-1">&ldquo;{customer.notes}&rdquo;</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => setIsEditCustOpen(true)}>
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Contact</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsAddCardOpen(true)}>
              <Plus className="w-3.5 h-3.5" />
              <span>Add Scheme Card</span>
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsRecordPayOpen(true)}>
              <Receipt className="w-3.5 h-3.5" />
              <span>Record Payment</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Payment Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">Total Scheme Value</span>
          <span className="mt-1.5 text-lg sm:text-xl font-bold text-slate-900 block">
            {formatCurrency(totalSchemeValue)}
          </span>
          <span className="text-[11px] text-slate-400">{schemeCards.length} scheme cards</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">Total Paid</span>
          <span className="mt-1.5 text-lg sm:text-xl font-bold text-emerald-700 block">
            {formatCurrency(totalAmountPaid)}
          </span>
          <span className="text-[11px] text-emerald-600">Installments received</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">Remaining Balance</span>
          <span className="mt-1.5 text-lg sm:text-xl font-bold text-slate-900 block">
            {formatCurrency(totalRemaining)}
          </span>
          <span className="text-[11px] text-slate-400">Balance due</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">Pending / Advance</span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-bold text-rose-600">
              {pendingInstallmentsCount}
            </span>
            <span className="text-xs text-slate-400">due /</span>
            <span className="text-lg sm:text-xl font-bold text-blue-600">
              {advanceInstallmentsCount}
            </span>
            <span className="text-xs text-slate-400">adv</span>
          </div>
          <span className="text-[11px] text-slate-400">Installment schedule</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs col-span-2 sm:col-span-1">
          <span className="text-xs font-medium text-slate-500 block">Next Payment Due</span>
          <span className="mt-1.5 text-base sm:text-lg font-semibold text-slate-900 block truncate">
            {nextPaymentDue ? formatDate(nextPaymentDue) : 'All Caught Up'}
          </span>
          <span className="text-[11px] text-slate-400">Next installment date</span>
        </div>
      </div>

      {/* Scheme Cards Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-slate-500" />
            <h2 className="text-base font-semibold text-slate-900">New City Scheme Cards</h2>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsAddCardOpen(true)}>
            <Plus className="w-3.5 h-3.5" />
            <span>New Scheme Card</span>
          </Button>
        </div>

        {schemeCards.length === 0 ? (
          <div className="p-8 bg-white border border-slate-200 rounded-lg text-center text-xs text-slate-400">
            No active scheme cards for this customer. Click &quot;Add Scheme Card&quot; to issue one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schemeCards.map((card) => {
              const isSelected = card._id === selectedCardId;
              const paidPercent = Math.min(
                100,
                Math.round(((card.totalPaid || 0) / card.totalAmount) * 100)
              );

              return (
                <div
                  key={card._id}
                  onClick={() => setSelectedCardId(card._id)}
                  className={`p-4 bg-white border rounded-lg transition-all cursor-pointer shadow-xs ${
                    isSelected
                      ? 'border-slate-900 ring-1 ring-slate-900'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {card.cardNumber}
                    </span>
                    <Badge status={card.status} />
                  </div>

                  <div className="mt-2 text-sm font-medium text-slate-900">{card.schemeName}</div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                    <span>Monthly: {formatCurrency(card.monthlyInstallment)}</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(card.totalAmount)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Progress</span>
                      <span>
                        {card.paidInstallmentsCount || 0} / {card.totalInstallments} ({paidPercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-slate-900 h-1.5 rounded-full transition-all"
                        style={{ width: `${paidPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Paid: {formatCurrency(card.totalPaid || 0)}</span>
                    <span>Rem: {formatCurrency(card.remainingAmount || 0)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Card Installments Schedule */}
      {selectedCardDetails && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Installment Schedule &bull; {selectedCardDetails.cardNumber}
              </h3>
              <p className="text-xs text-slate-500">
                20-Month schedule under New City Scheme with status and amounts.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsRecordPayOpen(true)}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Pay For This Card</span>
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-4">#</th>
                  <th className="py-2.5 px-4">Due Date</th>
                  <th className="py-2.5 px-4">Due Amount</th>
                  <th className="py-2.5 px-4">Paid Amount</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Payment Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {selectedCardDetails.installments?.map((inst) => (
                  <tr key={inst._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-medium text-slate-700">
                      #{inst.installmentNumber}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">{formatDate(inst.dueDate)}</td>
                    <td className="py-2.5 px-4 font-medium text-slate-900">
                      {formatCurrency(inst.dueAmount)}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-emerald-700">
                      {inst.paidAmount > 0 ? formatCurrency(inst.paidAmount) : '-'}
                    </td>
                    <td className="py-2.5 px-4">
                      <Badge status={inst.status} />
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 font-mono">
                      {inst.paidDate ? formatDate(inst.paidDate) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment History Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Payment History</h3>
            <p className="text-xs text-slate-500">Complete record of payments made by this customer.</p>
          </div>
          <span className="text-xs text-slate-500">{payments.length} transactions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Payment Date</th>
                <th className="py-3 px-4">Scheme Card</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Installments Covered</th>
                <th className="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No payments recorded yet.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {formatDate(p.paymentDate)}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">
                      {p.schemeCard?.cardNumber || 'Card'}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-700">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="py-3 px-4 text-slate-700">{p.paymentMethod}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono">
                        #{p.installmentsCovered?.join(', #') || '1'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{p.notes || '-'}</td>
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
        onSuccess={loadCustomerData}
        preselectedCustomerId={id}
        preselectedSchemeCardId={selectedCardId || undefined}
      />

      {/* Add Scheme Card Modal */}
      <AddSchemeCardModal
        isOpen={isAddCardOpen}
        onClose={() => setIsAddCardOpen(false)}
        onSuccess={loadCustomerData}
        preselectedCustomerId={id}
      />

      {/* Edit Customer Modal */}
      {isEditCustOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsEditCustOpen(false)}
          title="Edit Customer Information"
          description="Update personal and contact details."
          maxWidth="md"
        >
          <form onSubmit={handleUpdateContact} className="space-y-4">
            <Input
              label="Customer Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />
            <Input
              label="Phone Number"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              required
            />
            <Input
              label="Address (Optional)"
              value={editAddress}
              onChange={(e) => setEditAddress(e.target.value)}
            />
            <Input
              label="Notes (Optional)"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
            />

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditCustOpen(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isUpdating}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
