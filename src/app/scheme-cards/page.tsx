'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Plus, CreditCard, Receipt, Eye, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { SchemeCard } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { AddSchemeCardModal } from '@/components/scheme-cards/AddSchemeCardModal';
import { RecordPaymentModal } from '@/components/payments/RecordPaymentModal';
import { useSchemeData } from '@/context/SchemeDataContext';

export default function SchemeCardsPage() {
  const { showToast } = useToast();
  const { schemeCards, refreshAll } = useSchemeData();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'Completed' | 'Inactive'>('ALL');

  // Modals
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [isRecordPayOpen, setIsRecordPayOpen] = useState(false);
  const [selectedPayCustomer, setSelectedPayCustomer] = useState<string | undefined>();
  const [selectedPayCard, setSelectedPayCard] = useState<string | undefined>();

  const [editingCard, setEditingCard] = useState<SchemeCard | null>(null);
  const [editStatus, setEditStatus] = useState<SchemeCard['status']>('Active');
  const [isUpdating, setIsUpdating] = useState(false);

  const [deletingCard, setDeletingCard] = useState<SchemeCard | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/scheme-cards/${editingCard._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: editStatus }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update');

      showToast(`Card ${editingCard.cardNumber} status updated to ${editStatus}`, 'success');
      setEditingCard(null);
      await refreshAll();
    } catch (err: any) {
      showToast(err.message || 'Error updating card status', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteCard = async () => {
    if (!deletingCard) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/scheme-cards/${deletingCard._id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete');

      showToast(`Scheme Card ${deletingCard.cardNumber} deleted.`, 'success');
      setDeletingCard(null);
      await refreshAll();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete scheme card', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenPay = (customerId: string, cardId: string) => {
    setSelectedPayCustomer(customerId);
    setSelectedPayCard(cardId);
    setIsRecordPayOpen(true);
  };

  // Instant in-memory filtering
  const filteredCards = useMemo(() => {
    return schemeCards.filter((c) => {
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
      if (!search || !search.trim()) return true;

      const q = search.toLowerCase().trim();
      const matchesCardNo = c.cardNumber.toLowerCase().includes(q);
      const matchesScheme = c.schemeName.toLowerCase().includes(q);
      const matchesCustName = c.customer?.name.toLowerCase().includes(q) || false;
      const matchesCustPhone = c.customer?.phone.toLowerCase().includes(q) || false;
      return matchesCardNo || matchesScheme || matchesCustName || matchesCustPhone;
    });
  }, [schemeCards, statusFilter, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Scheme Cards Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Issue, track installments, and manage active New City Scheme cards.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsAddCardOpen(true)}>
          <Plus className="w-3.5 h-3.5" />
          <span>New Scheme Card</span>
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search card number, scheme, or customer..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 placeholder:text-slate-400"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-md text-xs font-medium text-slate-600 shrink-0">
          {(['ALL', 'Active', 'Completed', 'Inactive'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded transition-colors ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Scheme Cards Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Card Number</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Scheme Details</th>
                <th className="py-3 px-4">Installment Progress</th>
                <th className="py-3 px-4">Collection Summary</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredCards.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                    No scheme cards found.
                  </td>
                </tr>
              ) : (
                filteredCards.map((card) => {
                  const paidCount = card.paidInstallmentsCount || 0;
                  const totalCount = card.totalInstallments || 20;
                  const progressPct = Math.min(100, Math.round((paidCount / totalCount) * 100));

                  return (
                    <tr key={card._id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Card Number */}
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/contacts/${card.customerId}`}
                          className="font-mono font-semibold text-slate-900 hover:underline block"
                        >
                          {card.cardNumber}
                        </Link>
                        <span className="text-[11px] text-slate-400">
                          Started {formatDate(card.startDate)}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/contacts/${card.customerId}`}
                          className="font-medium text-slate-900 hover:underline block"
                        >
                          {card.customer?.name || 'Customer'}
                        </Link>
                        <span className="text-xs text-slate-500 font-mono">
                          {card.customer?.phone || '-'}
                        </span>
                      </td>

                      {/* Scheme Details */}
                      <td className="py-3.5 px-4 text-xs">
                        <div className="font-medium text-slate-900">{card.schemeName}</div>
                        <div className="text-slate-500 mt-0.5">
                          {formatCurrency(card.monthlyInstallment)} / mo &bull; Total {formatCurrency(card.totalAmount)}
                        </div>
                      </td>

                      {/* Installment Progress */}
                      <td className="py-3.5 px-4">
                        <div className="w-36 space-y-1">
                          <div className="flex justify-between text-xs text-slate-600">
                            <span>
                              {paidCount}/{totalCount}
                            </span>
                            <span className="font-medium text-slate-900">{progressPct}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-slate-900 h-1.5 rounded-full transition-all"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Collection Summary */}
                      <td className="py-3.5 px-4 text-xs">
                        <div className="text-emerald-700 font-semibold">
                          Paid: {formatCurrency(card.totalPaid || 0)}
                        </div>
                        <div className="text-slate-500 mt-0.5">
                          Rem: {formatCurrency(card.remainingAmount || 0)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <Badge status={card.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenPay(card.customerId, card._id)}
                            className="text-xs h-7 px-2"
                            title="Record Payment"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Pay</span>
                          </Button>
                          <Link
                            href={`/contacts/${card.customerId}`}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                            title="View Customer Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => {
                              setEditingCard(card);
                              setEditStatus(card.status);
                            }}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                            title="Edit Status"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingCard(card)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete Card"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Scheme Card Modal */}
      <AddSchemeCardModal
        isOpen={isAddCardOpen}
        onClose={() => setIsAddCardOpen(false)}
        onSuccess={refreshAll}
      />

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isRecordPayOpen}
        onClose={() => setIsRecordPayOpen(false)}
        onSuccess={refreshAll}
        preselectedCustomerId={selectedPayCustomer}
        preselectedSchemeCardId={selectedPayCard}
      />

      {/* Edit Scheme Card Status Modal */}
      {editingCard && (
        <Modal
          isOpen={true}
          onClose={() => setEditingCard(null)}
          title={`Edit Card Status • ${editingCard.cardNumber}`}
          description="Update card operational status."
          maxWidth="sm"
        >
          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <Select
              label="Scheme Card Status"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as any)}
            >
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Inactive">Inactive</option>
            </Select>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingCard(null)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isUpdating}>
                Update Status
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCard && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingCard(null)}
          title="Delete Scheme Card"
          description="Are you sure you want to delete this scheme card? All associated installments and payment records will be removed."
          maxWidth="sm"
        >
          <div className="space-y-4">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>
                Card: <strong>{deletingCard.cardNumber}</strong> ({deletingCard.schemeName})
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeletingCard(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleDeleteCard}
                isLoading={isDeleting}
              >
                Delete Card
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
