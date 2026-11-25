'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { AlertCircle } from 'lucide-react';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (createdCustomer: any) => void;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Customer name is required.');
      return;
    }

    if (!phone.trim()) {
      setError('Phone number is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          notes: notes.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Unable to add customer. Please try again.');
      }

      showToast(`Customer "${name}" added successfully!`, 'success');
      setName('');
      setPhone('');
      setAddress('');
      setNotes('');
      onSuccess?.(json.data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add customer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Customer"
      description="Add customer contact information to the scheme database."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-md">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Input
          label="Customer Name"
          placeholder="e.g. Ramesh Chandra"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Phone Number"
          placeholder="e.g. 98765 43210"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />

        <Input
          label="Address (Optional)"
          placeholder="e.g. 12, Market Road, Near Town Hall"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <Input
          label="Notes / Reference (Optional)"
          placeholder="e.g. Referred by Suresh"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Save Customer
          </Button>
        </div>
      </form>
    </Modal>
  );
};

