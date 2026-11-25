'use client';

import React from 'react';
import { Menu, Plus, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface HeaderProps {
  onOpenSidebar: () => void;
  onOpenRecordPayment: () => void;
  onOpenAddCustomer?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSidebar,
  onOpenRecordPayment,
  onOpenAddCustomer,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/95 backdrop-blur-xs border-b border-slate-200/80">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-1.5 text-slate-500 rounded-md hover:text-slate-800 hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block text-xs font-medium text-slate-500">
          New City Scheme &bull; Monthly Installment Plan
        </div>
      </div>

      {/* Global Quick Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onOpenAddCustomer && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenAddCustomer}
            className="hidden sm:inline-flex"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Customer</span>
          </Button>
        )}
        <Button
          variant="primary"
          size="sm"
          onClick={onOpenRecordPayment}
          className="shadow-sm"
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Record Payment</span>
        </Button>
      </div>
    </header>
  );
};
