'use client';

import React, { useState, useEffect } from 'react';
import { Store, ShieldCheck, Database, Save, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { Settings } from '@/types';
import { useSchemeData } from '@/context/SchemeDataContext';

export default function SettingsPage() {
  const { showToast } = useToast();
  const { settings: cachedSettings, refreshAll } = useSchemeData();

  const [settings, setSettings] = useState<Settings>({
    shopName: 'New City Scheme',
    shopLogoUrl: '',
    phone: '+91 98450 12345',
    address: 'New City Commercial Complex, Main Road',
    currency: '₹',
    defaultSchemeName: 'New City Scheme',
    defaultMonthlyInstallment: 500,
    defaultTotalInstallments: 20,
    defaultDurationMonths: 20,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (cachedSettings) {
      setSettings(cachedSettings);
    }
  }, [cachedSettings]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to save');

      showToast('New City Scheme configuration saved successfully!', 'success');
      await refreshAll();
    } catch (err: any) {
      showToast(err.message || 'Error updating settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDemoData = async () => {
    if (!confirm('Re-seed New City Scheme realistic demo data? This will restore 16 realistic customers, payment scenarios, and prize draws.')) {
      return;
    }

    setIsResetting(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to re-seed');

      showToast('Demo data re-seeded successfully with New City Scheme!', 'success');
      await refreshAll();
    } catch (err: any) {
      showToast(err.message || 'Error re-seeding data', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Settings & Configuration
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configure New City Scheme branding, default installment amounts, scheme duration, and demo data.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Shop Information Section */}
        <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Store className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-semibold text-slate-900">Scheme Profile & Branding</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Scheme / Business Name"
              value={settings.shopName}
              onChange={(e) => setSettings({ ...settings, shopName: e.target.value })}
              required
            />

            <Input
              label="Contact Phone Number"
              value={settings.phone || ''}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              placeholder="+91 98765 43210"
            />
          </div>

          <Input
            label="Business Address"
            value={settings.address || ''}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            placeholder="Commercial address for receipts and scheme documents"
          />

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-600 space-y-1">
            <div className="flex items-center gap-2 font-medium text-slate-800">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Branding & Visual Identity</span>
            </div>
            <p>
              Branding is configured for <strong>New City Scheme</strong> using the premium neutral 3-color palette
              (Obsidian, Slate, Sapphire Accent). Once official poster art or custom logos are uploaded,
              the accent system will dynamically align.
            </p>
          </div>
        </div>

        {/* Scheme Configuration */}
        <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <ShieldCheck className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-semibold text-slate-900">Default Scheme Configuration</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Default Scheme Title"
              value={settings.defaultSchemeName}
              onChange={(e) => setSettings({ ...settings, defaultSchemeName: e.target.value })}
              required
            />

            <Input
              label="Currency Symbol"
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Monthly Installment (₹)"
              type="number"
              min="100"
              value={settings.defaultMonthlyInstallment}
              onChange={(e) =>
                setSettings({ ...settings, defaultMonthlyInstallment: Number(e.target.value) })
              }
              required
            />

            <Input
              label="Total Installments"
              type="number"
              min="1"
              max="60"
              value={settings.defaultTotalInstallments}
              onChange={(e) =>
                setSettings({ ...settings, defaultTotalInstallments: Number(e.target.value) })
              }
              required
            />

            <Input
              label="Duration (Months)"
              type="number"
              min="1"
              max="60"
              value={settings.defaultDurationMonths}
              onChange={(e) =>
                setSettings({ ...settings, defaultDurationMonths: Number(e.target.value) })
              }
              required
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-600 flex justify-between items-center">
            <span>Calculated Default Scheme Value:</span>
            <span className="font-bold text-slate-900 text-sm">
              {settings.currency}
              {(
                (settings.defaultMonthlyInstallment || 0) * (settings.defaultTotalInstallments || 0)
              ).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Save Settings Action */}
        <div className="flex justify-end">
          <Button type="submit" variant="primary" isLoading={isSaving} className="gap-2">
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </Button>
        </div>
      </form>

      {/* Demo Data Management */}
      <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Database className="w-4 h-4 text-slate-700" />
          <h2 className="text-sm font-semibold text-slate-900">Demo Data & Quick Reset</h2>
        </div>

        <p className="text-xs text-slate-500">
          Reset all customer records, payments, and prize draws to the clean realistic New City Scheme scenario.
          Includes 16 customers with regular payments, 2-month advances, missed installments, late payments,
          and completed lucky draws.
        </p>

        <div className="pt-2 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Database status: Connected (New City Scheme Engine)
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetDemoData}
            isLoading={isResetting}
            className="text-slate-700 hover:text-slate-900 gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
