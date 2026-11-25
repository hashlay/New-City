'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastProvider } from '@/components/ui/Toast';
import { SchemeDataProvider } from '@/context/SchemeDataContext';
import { RecordPaymentModal } from '@/components/payments/RecordPaymentModal';
import { AddCustomerModal } from '@/components/contacts/AddCustomerModal';

export const ClientLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);

  return (
    <SchemeDataProvider>
      <ToastProvider>
        <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
          {/* Sidebar */}
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          {/* Main Content Area */}
          <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
            <Header
              onOpenSidebar={() => setSidebarOpen(true)}
              onOpenRecordPayment={() => setRecordPaymentOpen(true)}
              onOpenAddCustomer={() => setAddCustomerOpen(true)}
            />

            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              {children}
            </main>
          </div>

          {/* Global Modals */}
          <RecordPaymentModal
            isOpen={recordPaymentOpen}
            onClose={() => setRecordPaymentOpen(false)}
            onSuccess={() => {
              window.dispatchEvent(new CustomEvent('scheme:data-updated'));
            }}
          />

          <AddCustomerModal
            isOpen={addCustomerOpen}
            onClose={() => setAddCustomerOpen(false)}
            onSuccess={() => {
              window.dispatchEvent(new CustomEvent('scheme:data-updated'));
            }}
          />
        </div>
      </ToastProvider>
    </SchemeDataProvider>
  );
};
