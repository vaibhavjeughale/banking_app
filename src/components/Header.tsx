import React, { useState } from 'react';
import {
  Bell,
  Sun,
  Moon,
  Shield,
  UserCheck,
  Check,
  CheckCheck,
  Menu,
  Activity,
  ArrowRightLeft
} from 'lucide-react';
import { User, Notification } from '../types';

interface HeaderProps {
  user: User | null;
  onSwitchPersona: (role: string) => void;
  notifications: Notification[];
  unreadCount: number;
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  onOpenTransferModal: () => void;
  onToggleSidebar: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  isConnectedSSE: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onSwitchPersona,
  notifications,
  unreadCount,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onOpenTransferModal,
  onToggleSidebar,
  darkMode,
  onToggleDarkMode,
  isConnectedSSE
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  const personas = [
    { role: 'CUSTOMER', name: 'Alex Morgan', desc: 'Customer · Everyday Accounts' },
    { role: 'SUPPORT_AGENT', name: 'Sarah Jenkins', desc: 'Support Agent · Client Service' },
    { role: 'COMPLIANCE_OFFICER', name: 'Elena Rostova', desc: 'Compliance Officer · Risk & AML' },
    { role: 'ADMIN', name: 'Marcus Vance', desc: 'Administrator · System Ops' }
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Left: Mobile Toggle & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-teal-600 flex items-center justify-center text-white shadow-xs">
            <span className="font-extrabold text-sm tracking-wider">NB</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">NexaBank</span>
              <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">AI</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">Digital Banking & AI Core</p>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Real-Time SSE Indicator */}
        <div
          title={isConnectedSSE ? 'Live Real-Time SSE Connected' : 'Reconnecting to SSE Stream...'}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300"
        >
          <span className={`w-2 h-2 rounded-full ${isConnectedSSE ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className="font-mono text-[10px]">{isConnectedSSE ? 'LIVE SYNC' : 'OFFLINE'}</span>
        </div>

        {/* Quick Send Money button */}
        <button
          onClick={onOpenTransferModal}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Transfer Money</span>
        </button>

        {/* Persona Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowPersonaMenu(!showPersonaMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-800 dark:text-slate-200 transition"
          >
            <Shield className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span className="hidden sm:inline">{user?.roles[0] || 'CUSTOMER'}</span>
            <span className="text-[10px] text-slate-600 dark:text-slate-300 font-semibold bg-slate-200 dark:bg-slate-700 px-1 rounded">Switch</span>
          </button>

          {showPersonaMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-40">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">Demo Persona & RBAC Switcher</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Switch roles to test permissions & workflows</p>
              </div>
              <div className="p-1 space-y-1">
                {personas.map((p) => {
                  const isActive = user?.roles.includes(p.role as any);
                  return (
                    <button
                      key={p.role}
                      onClick={() => {
                        onSwitchPersona(p.role);
                        setShowPersonaMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition ${
                        isActive
                          ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 font-semibold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-medium">{p.name}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{p.desc}</p>
                      </div>
                      {isActive && <Check className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowPersonaMenu(false);
            }}
            className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-teal-600 rounded-full">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-40">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Account Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400">({unreadCount} unread)</span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllNotificationsRead}
                    className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">No notifications on record.</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => onMarkNotificationRead(n.id)}
                      className={`p-3 text-xs transition cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                        !n.readAt ? 'bg-teal-50/40 dark:bg-teal-950/20' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{n.title}</span>
                        <span className="text-[10px] text-slate-600 dark:text-slate-300 shrink-0">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Dark/Light mode toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <img
            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'}
            alt={user?.name || 'User'}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
          />
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">{user?.name || 'Alex Morgan'}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[120px]">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
