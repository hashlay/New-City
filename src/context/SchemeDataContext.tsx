'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Customer, SchemeCard, Payment, Draw, Settings, DashboardStats } from '@/types';

export interface DashboardData {
  stats: DashboardStats;
  recentPayments: Payment[];
  upcomingPayments: Array<{
    customer: Customer;
    schemeCard: SchemeCard;
    dueDate: string;
    dueAmount: number;
    installmentNumber: number;
  }>;
  duePayments: Array<{
    customer: Customer;
    schemeCard: SchemeCard;
    dueDate: string;
    dueAmount: number;
    installmentNumber: number;
    overdueDays: number;
  }>;
  recentCustomers: Customer[];
}

interface SchemeDataContextType {
  dashboardData: DashboardData | null;
  customers: Customer[];
  schemeCards: SchemeCard[];
  payments: Payment[];
  draws: Draw[];
  settings: Settings | null;
  isInitialLoaded: boolean;
  refreshAll: () => Promise<void>;
  refreshSection: (section: 'dashboard' | 'customers' | 'scheme-cards' | 'payments' | 'draws' | 'settings') => Promise<void>;
}

const SchemeDataContext = createContext<SchemeDataContextType | undefined>(undefined);

export const SchemeDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [schemeCards, setSchemeCards] = useState<SchemeCard[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isInitialLoaded, setIsInitialLoaded] = useState(false);

  // Fetch all core datasets in parallel on initial app boot
  const refreshAll = useCallback(async () => {
    try {
      const [dashRes, custRes, cardRes, payRes, drawRes, settRes] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/customers'),
        fetch('/api/scheme-cards'),
        fetch('/api/payments'),
        fetch('/api/draws'),
        fetch('/api/settings'),
      ]);

      const [dashJson, custJson, cardJson, payJson, drawJson, settJson] = await Promise.all([
        dashRes.json(),
        custRes.json(),
        cardRes.json(),
        payRes.json(),
        drawRes.json(),
        settRes.json(),
      ]);

      if (dashJson.success) setDashboardData(dashJson.data);
      if (custJson.success) setCustomers(custJson.data);
      if (cardJson.success) setSchemeCards(cardJson.data);
      if (payJson.success) setPayments(payJson.data);
      if (drawJson.success) setDraws(drawJson.data);
      if (settJson.success) setSettings(settJson.data);
    } catch (err) {
      console.error('Error refreshing scheme data:', err);
    } finally {
      setIsInitialLoaded(true);
    }
  }, []);

  const refreshSection = useCallback(async (section: 'dashboard' | 'customers' | 'scheme-cards' | 'payments' | 'draws' | 'settings') => {
    try {
      const res = await fetch(`/api/${section}`);
      const json = await res.json();
      if (!json.success) return;

      if (section === 'dashboard') setDashboardData(json.data);
      else if (section === 'customers') setCustomers(json.data);
      else if (section === 'scheme-cards') setSchemeCards(json.data);
      else if (section === 'payments') setPayments(json.data);
      else if (section === 'draws') setDraws(json.data);
      else if (section === 'settings') setSettings(json.data);
    } catch (err) {
      console.error(`Error refreshing ${section}:`, err);
    }
  }, []);

  useEffect(() => {
    refreshAll();

    const handleUpdate = () => {
      refreshAll();
    };

    window.addEventListener('scheme:data-updated', handleUpdate);
    return () => window.removeEventListener('scheme:data-updated', handleUpdate);
  }, [refreshAll]);

  return (
    <SchemeDataContext.Provider
      value={{
        dashboardData,
        customers,
        schemeCards,
        payments,
        draws,
        settings,
        isInitialLoaded,
        refreshAll,
        refreshSection,
      }}
    >
      {children}
    </SchemeDataContext.Provider>
  );
};

export const useSchemeData = () => {
  const context = useContext(SchemeDataContext);
  if (!context) {
    throw new Error('useSchemeData must be used within a SchemeDataProvider');
  }
  return context;
};

