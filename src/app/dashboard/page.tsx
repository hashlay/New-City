'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  CreditCard,
  TrendingUp,
  Calendar,
  AlertCircle,
  Receipt,
  Plus,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { RecordPaymentModal } from '@/components/payments/RecordPaymentModal';
import { AddCustomerModal } from '@/components/contacts/AddCustomerModal';
import { AddSchemeCardModal } from '@/components/scheme-cards/AddSchemeCardModal';
import { useSchemeData } from '@/context/SchemeDataContext';

export default function DashboardPage() {
  const { dashboardData, isInitialLoaded, refreshAll } = useSchemeData();

  // Modals state
  const [isRecordPayOpen, setIsRecordPayOpen] = useState(false);
  const [isAddCustOpen, setIsAddCustOpen] = useState(false);
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [prefilledCustomer, setPrefilledCustomer] = useState<string | undefined>();
  const [prefilledCard, setPrefilledCard] = useState<string | undefined>();

  const handlePayDue = (customerId: string, cardId: string) => {
    setPrefilledCustomer(customerId);
    setPrefilledCard(cardId);
    setIsRecordPayOpen(true);
  };

  const stats = dashboardData?.stats || {
    totalCustomers: 0,
    activeSchemeCards: 0,
    totalCollection: 0,
    thisMonthCollection: 0,
    pendingPaymentsAmount: 0,
    pendingInstallmentsTotal: 0,
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            New City Scheme Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time status of subscribers, monthly collections, and prize draws.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setPrefilledCustomer(undefined);
              setIsAddCardOpen(true);
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Scheme Card</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setPrefilledCustomer(undefined);
              setPrefilledCard(undefined);
              setIsRecordPayOpen(true);
            }}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Record Payment</span>
          </Button>
        </div>
      </div>

      {/* 5 Minimal Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Customers */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-lg shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Customers</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {stats.totalCustomers}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Registered members</div>
        </div>

        {/* Active Scheme Cards */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-lg shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Active Scheme Cards</span>
            <CreditCard className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {stats.activeSchemeCards}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">New City Scheme plans</div>
        </div>

        {/* Total Collection */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-lg shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Collection</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {formatCurrency(stats.totalCollection)}
          </div>
          <div className="mt-1 text-[11px] text-emerald-700 font-medium">Lifetime collections</div>
        </div>

        {/* This Month's Collection */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-lg shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>This Month</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {formatCurrency(stats.thisMonthCollection)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Current calendar month</div>
        </div>

        {/* Pending Payments */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-lg shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Pending Payments</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-rose-600">
            {formatCurrency(stats.pendingPaymentsAmount)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {stats.pendingInstallmentsTotal} installments due
          </div>
        </div>
      </div>

      {/* Grid: Payments Due & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Due (Pending/Overdue Actionable Section) */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <h2 className="text-sm font-semibold text-slate-900">Payment Due</h2>
            </div>
            <span className="text-xs text-slate-500">
              {dashboardData?.duePayments.length || 0} pending subscribers
            </span>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {!dashboardData?.duePayments || dashboardData.duePayments.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                All customer installments are up to date.
              </div>
            ) : (
              dashboardData.duePayments.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors"
                >
                  <div className="min-w-0 pr-3">
                    <Link
                      href={`/contacts/${item.customer._id}`}
                      className="text-xs font-semibold text-slate-900 hover:underline block truncate"
                    >
                      {item.customer.name}
                    </Link>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                      <span className="font-mono">{item.schemeCard.cardNumber}</span>
                      <span>&bull;</span>
                      <span>Inst. #{item.installmentNumber}</span>
                      <span>&bull;</span>
                      <span className="text-rose-600 font-medium">
                        {item.overdueDays} days overdue
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-bold text-slate-900">
                      {formatCurrency(item.dueAmount)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePayDue(item.customer._id, item.schemeCard._id)}
                      className="text-xs h-7 px-2.5"
                    >
                      Pay Now
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Payments Section */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <h2 className="text-sm font-semibold text-slate-900">Recent Payments</h2>
            </div>
            <Link
              href="/payments"
              className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {!dashboardData?.recentPayments || dashboardData.recentPayments.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No recent payments recorded.
              </div>
            ) : (
              dashboardData.recentPayments.map((p) => (
                <div
                  key={p._id}
                  className="p-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors"
                >
                  <div className="min-w-0 pr-3">
                    <Link
                      href={`/contacts/${p.customerId}`}
                      className="text-xs font-semibold text-slate-900 hover:underline block truncate"
                    >
                      {p.customer?.name || 'Customer'}
                    </Link>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                      <span className="font-mono">{p.schemeCard?.cardNumber}</span>
                      <span>&bull;</span>
                      <span>{formatDate(p.paymentDate)}</span>
                      <span>&bull;</span>
                      <span>{p.paymentMethod}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-emerald-700 block">
                      +{formatCurrency(p.amount)}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Covered: #{p.installmentsCovered?.join(', #') || '1'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Grid: Upcoming Payments & Recent Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Payments */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <h2 className="text-sm font-semibold text-slate-900">Upcoming Installments</h2>
            </div>
            <span className="text-xs text-slate-500">Next scheduled due dates</span>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {!dashboardData?.upcomingPayments || dashboardData.upcomingPayments.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No upcoming installments scheduled.
              </div>
            ) : (
              dashboardData.upcomingPayments.map((u, i) => (
                <div
                  key={i}
                  className="p-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors"
                >
                  <div className="min-w-0 pr-3">
                    <Link
                      href={`/contacts/${u.customer._id}`}
                      className="text-xs font-semibold text-slate-900 hover:underline block truncate"
                    >
                      {u.customer.name}
                    </Link>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Card <span className="font-mono font-medium">{u.schemeCard.cardNumber}</span> &bull; Due on {formatDate(u.dueDate)}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-semibold text-slate-900 block">
                      {formatCurrency(u.dueAmount)}
                    </span>
                    <span className="text-[10px] text-slate-500">Installment #{u.installmentNumber}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Customers */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-500" />
              <h2 className="text-sm font-semibold text-slate-900">Recent Customers</h2>
            </div>
            <Link
              href="/contacts"
              className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {!dashboardData?.recentCustomers || dashboardData.recentCustomers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No customers enrolled yet.
              </div>
            ) : (
              dashboardData.recentCustomers.map((cust) => (
                <div
                  key={cust._id}
                  className="p-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors"
                >
                  <div className="min-w-0 pr-3">
                    <Link
                      href={`/contacts/${cust._id}`}
                      className="text-xs font-semibold text-slate-900 hover:underline block truncate"
                    >
                      {cust.name}
                    </Link>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {cust.phone} {cust.address ? `\u2022 ${cust.address}` : ''}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <Link
                      href={`/contacts/${cust._id}`}
                      className="text-xs text-slate-700 hover:text-slate-900 font-medium px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 transition-colors inline-block"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isRecordPayOpen}
        onClose={() => setIsRecordPayOpen(false)}
        onSuccess={refreshAll}
        preselectedCustomerId={prefilledCustomer}
        preselectedSchemeCardId={prefilledCard}
      />

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={isAddCustOpen}
        onClose={() => setIsAddCustOpen(false)}
        onSuccess={refreshAll}
      />

      {/* Add Scheme Card Modal */}
      <AddSchemeCardModal
        isOpen={isAddCardOpen}
        onClose={() => setIsAddCardOpen(false)}
        onSuccess={refreshAll}
      />
    </div>
  );
}
