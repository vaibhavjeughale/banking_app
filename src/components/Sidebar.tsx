import React from 'react';
import {
  LayoutDashboard,
  Wallet,
  ArrowRightLeft,
  Users,
  ReceiptText,
  BarChart3,
  Bot,
  ShieldAlert,
  FileCode2,
  Code2,
  X
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  userRoles: UserRole[];
  totalAvailableFormatted: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
  userRoles,
  totalAvailableFormatted
}) => {
  const isPrivileged =
    userRoles.includes('ADMIN') ||
    userRoles.includes('COMPLIANCE_OFFICER') ||
    userRoles.includes('SUPPORT_AGENT');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'accounts', label: 'Accounts & Cards', icon: Wallet },
    { id: 'transfers', label: 'Money Transfers', icon: ArrowRightLeft },
    { id: 'beneficiaries', label: 'Beneficiary Payees', icon: Users },
    { id: 'transactions', label: 'Transaction History', icon: ReceiptText },
    { id: 'analytics', label: 'Spending Analytics', icon: BarChart3 },
    { id: 'ai-assistant', label: 'GenAI Assistant', icon: Bot, highlight: true },
    ...(isPrivileged
      ? [{ id: 'admin', label: 'Operations & Admin', icon: ShieldAlert, badge: 'STAFF' }]
      : []),
    { id: 'angular-code', label: 'Angular 20 Codebase', icon: Code2, badge: 'FULL ANGULAR' },
    { id: 'architecture-docs', label: 'Architecture & API', icon: FileCode2 }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 flex flex-col w-64 h-screen bg-slate-950 text-slate-300 border-r border-slate-800 transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header inside Sidebar */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-slate-950 font-black text-sm">
              NB
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight">NexaBank</span>
              <span className="text-teal-400 font-bold ml-1 text-xs">ENTERPRISE</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
            Banking Core
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : item.highlight ? 'text-teal-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-semibold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
                {item.highlight && !isActive && (
                  <span className="w-2 h-2 rounded-full bg-teal-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom User Snapshot Widget */}
        <div className="p-4 mx-3 mb-4 rounded-xl bg-slate-900 border border-slate-800">
          <p className="text-[11px] font-medium text-slate-400">Total Available Balance</p>
          <p className="text-base font-bold text-white mt-0.5">{totalAvailableFormatted}</p>
          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-800">
            <span>Clearing Rail</span>
            <span className="text-teal-400 font-mono">FedNow Active</span>
          </div>
        </div>
      </aside>
    </>
  );
};
