'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Receipt,
  Gift,
  Settings,
  Building2,
  UserCheck,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/contacts', label: 'Contacts', icon: Users },
  { href: '/scheme-cards', label: 'Scheme Cards', icon: CreditCard },
  { href: '/payments', label: 'Payments', icon: Receipt },
  { href: '/draws', label: 'Draws', icon: Gift },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-white border-r border-slate-200 transition-transform duration-200 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand / Logo Area with Luxury Store Typography */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-100">
          <Link
            href="/dashboard"
            prefetch={true}
            className="flex items-center gap-3 group"
            onClick={onClose}
          >
            {/* New City Scheme Logo Icon */}
            <div className="flex items-center justify-center w-9 h-9 rounded-md bg-slate-900 text-white font-semibold text-sm shadow-sm group-hover:bg-slate-800 transition-colors">
              <Building2 className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <div className="font-display text-xs font-bold text-slate-900 tracking-wider uppercase leading-tight">
                New City Scheme
              </div>
              <div className="text-[10px] text-slate-500 font-medium tracking-wide uppercase leading-tight mt-0.5">
                Premium Retail Portal
              </div>
            </div>
          </Link>

          {/* Close button on mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 lg:hidden"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                )}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0',
                    isActive ? 'text-white' : 'text-slate-500'
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* User Account / Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-700 text-xs font-semibold">
              <UserCheck className="w-4 h-4 text-slate-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">Store Admin</p>
              <p className="text-[11px] text-slate-500 truncate">New City Manager</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500" title="System Online" />
          </div>
        </div>
      </aside>
    </>
  );
};
