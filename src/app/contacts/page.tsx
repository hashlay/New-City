'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Plus, Eye, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Customer } from '@/types';
import { AddCustomerModal } from '@/components/contacts/AddCustomerModal';
import { useSchemeData } from '@/context/SchemeDataContext';

export default function ContactsPage() {
  const { showToast } = useToast();
  const { customers, schemeCards, refreshAll } = useSchemeData();

  const [search, setSearch] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const handleStartEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setEditName(customer.name);
    setEditPhone(customer.phone);
    setEditAddress(customer.address || '');
    setEditNotes(customer.notes || '');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/customers/${editingCustomer._id}`, {
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

      showToast('Customer contact updated successfully!', 'success');
      setEditingCustomer(null);
      await refreshAll();
    } catch (err: any) {
      showToast(err.message || 'Error updating customer', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCustomer) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/customers/${deletingCustomer._id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete');

      showToast(`Customer ${deletingCustomer.name} deleted.`, 'success');
      setDeletingCustomer(null);
      await refreshAll();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete customer', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Instant in-memory search and filter
  const filteredCustomers = useMemo(() => {
    if (!search || !search.trim()) return customers;
    const q = search.toLowerCase().trim();

    return customers.filter((c) => {
      const matchesName = c.name.toLowerCase().includes(q);
      const matchesPhone = c.phone.toLowerCase().includes(q);
      const userCards = schemeCards.filter((sc) => sc.customerId === c._id);
      const matchesCard = userCards.some((sc) => sc.cardNumber.toLowerCase().includes(q));
      return matchesName || matchesPhone || matchesCard;
    });
  }, [customers, schemeCards, search]);

  const getCustomerCardInfo = (customerId: string) => {
    const cards = schemeCards.filter((c) => c.customerId === customerId);
    let overallStatus = 'Active';

    if (cards.length === 0) {
      overallStatus = 'No Cards';
    } else if (cards.some((c) => (c.pendingInstallmentsCount || 0) > 0)) {
      overallStatus = 'Overdue';
    } else if (cards.some((c) => (c.advanceInstallmentsCount || 0) > 0)) {
      overallStatus = 'Advance';
    } else {
      overallStatus = 'Paid';
    }

    return { cards, overallStatus };
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Contacts Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage New City Scheme subscribers, contact details, and their linked scheme cards.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsAddOpen(true)}>
          <Plus className="w-3.5 h-3.5" />
          <span>Add Contact</span>
        </Button>
      </div>

      {/* Instant Search Bar */}
      <div className="relative max-w-md w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customer by name, phone, or scheme card number..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 placeholder:text-slate-400"
        />
      </div>

      {/* Customer List Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">Active Scheme Cards</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-slate-400">
                    No customers found matching &quot;{search}&quot;.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const { cards, overallStatus } = getCustomerCardInfo(c._id);

                  return (
                    <tr
                      key={c._id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Name */}
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/contacts/${c._id}`}
                          className="font-medium text-slate-900 hover:underline block"
                        >
                          {c.name}
                        </Link>
                        {c.address && (
                          <div className="text-xs text-slate-400 truncate max-w-xs mt-0.5">
                            {c.address}
                          </div>
                        )}
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">
                        {c.phone}
                      </td>

                      {/* Active Scheme Cards */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {cards.length === 0 ? (
                            <span className="text-xs text-slate-400">No cards</span>
                          ) : (
                            cards.map((card) => (
                              <Link
                                key={card._id}
                                href={`/scheme-cards?search=${encodeURIComponent(card.cardNumber)}`}
                                className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-mono font-medium hover:bg-slate-200 transition-colors"
                              >
                                {card.cardNumber}
                              </Link>
                            ))
                          )}
                        </div>
                      </td>

                      {/* Payment Status */}
                      <td className="py-3.5 px-4">
                        <Badge status={overallStatus} />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/contacts/${c._id}`}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                            title="View Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleStartEdit(c)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                            title="Edit Contact"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingCustomer(c)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete Contact"
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

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={refreshAll}
      />

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <Modal
          isOpen={true}
          onClose={() => setEditingCustomer(null)}
          title="Edit Customer Contact"
          description="Update customer details and contact information."
          maxWidth="md"
        >
          <form onSubmit={handleUpdate} className="space-y-4">
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
                onClick={() => setEditingCustomer(null)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isUpdating}>
                Update Contact
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCustomer && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingCustomer(null)}
          title="Delete Customer"
          description="Are you sure you want to delete this customer? This action will permanently remove their profile, scheme cards, and payment records."
          maxWidth="sm"
        >
          <div className="space-y-4">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>
                Customer: <strong>{deletingCustomer.name}</strong> ({deletingCustomer.phone})
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeletingCustomer(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                isLoading={isDeleting}
              >
                Delete Customer
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
