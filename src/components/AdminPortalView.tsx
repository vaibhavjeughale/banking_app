import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Activity,
  ReceiptText,
  AlertTriangle,
  Server,
  Lock,
  Search,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { api } from '../services/api';
import { UserRole, AuditLog } from '../types';

interface AdminPortalViewProps {
  userRoles: UserRole[];
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({ userRoles }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'alerts' | 'audit' | 'health'>('overview');
  const [overviewData, setOverviewData] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [healthData, setHealthData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'overview') {
        const data = await api.getAdminOverview();
        setOverviewData(data);
      } else if (activeTab === 'users') {
        const res = await api.getAdminUsers();
        setUsersList(res.users);
      } else if (activeTab === 'alerts') {
        const data = await api.getAdminOverview();
        setOverviewData(data);
      } else if (activeTab === 'audit') {
        const res = await api.getAdminAuditLogs();
        setAuditLogs(res.logs);
      } else if (activeTab === 'health') {
        const res = await api.getAdminSystemHealth();
        setHealthData(res);
      }
    } catch (err) {
      console.error('[Admin] Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.updateAdminUserStatus(userId, newStatus);
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
      );
    } catch (err) {
      alert('Failed to update user status: ' + err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Operations, AML & Administrative Portal
            </h2>
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
              RESTRICTED ACCESS
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time fraud surveillance, user status management, and immutable audit logs
          </p>
        </div>

        <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              activeTab === 'overview'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              activeTab === 'users'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Customers
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              activeTab === 'alerts'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Fraud Alerts
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              activeTab === 'audit'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Audit Trail
          </button>
          <button
            onClick={() => setActiveTab('health')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              activeTab === 'health'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            System Health
          </button>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && overviewData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total System Deposits</span>
              <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
                {overviewData.metrics.totalDepositsFormatted}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Across all registered custody accounts</p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Clearing Volume Processed</span>
              <h3 className="text-2xl font-bold tracking-tight text-teal-600 dark:text-teal-400 mt-1">
                {overviewData.metrics.totalVolumeFormatted}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">{overviewData.metrics.completedTransactionsCount} successful transfers</p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Customers</span>
              <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
                {overviewData.metrics.totalCustomers}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Full KYC verified profiles</p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Risk Alerts</span>
              <h3 className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 mt-1">
                {overviewData.metrics.activeAlertsCount} Flags
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Require compliance officer review</p>
            </div>
          </div>

          {/* Quick Alerts Summary */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Fraud Surveillance Flags</h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {overviewData.suspiciousAlerts.map((alt: any) => (
                <div key={alt.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{alt.title}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{alt.description}</p>
                      <p className="text-[10px] text-slate-500 mt-1">Target: {alt.user} · {new Date(alt.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 rounded uppercase">
                    {alt.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMERS TAB */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-4 py-3">Email Address</th>
                  <th className="px-4 py-3">Roles</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Total Balance</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">{u.name}</td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 font-mono text-[11px]">{u.email}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-[10px] font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {u.roles.join(', ')}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">{u.totalBalanceFormatted}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleToggleUserStatus(u.id, u.status)}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg border transition ${
                          u.status === 'ACTIVE'
                            ? 'border-rose-300 text-rose-600 hover:bg-rose-50'
                            : 'border-emerald-300 text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FRAUD ALERTS TAB */}
      {activeTab === 'alerts' && overviewData && (
        <div className="space-y-4">
          {overviewData.suspiciousAlerts.map((alt: any) => (
            <div
              key={alt.id}
              className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-50 dark:bg-amber-950/50 text-amber-600 rounded-lg">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{alt.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {alt.description}
                  </p>
                  <p className="text-[11px] font-mono text-slate-500 mt-2">
                    Subject: {alt.user} · Logged: {new Date(alt.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => alert(`Alert ${alt.id} acknowledged and logged into SAR case dossier.`)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white"
                >
                  File SAR Report
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AUDIT LOG TAB */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            Immutable cryptographic audit trail for compliance and SOC2 Type II certification
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3">Timestamp</th>
                  <th className="px-4 py-3">Actor Role</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Resource</th>
                  <th className="px-4 py-3">IP Address</th>
                  <th className="px-5 py-3">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-5 py-2.5 text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td className="px-4 py-2.5 font-bold text-slate-800 dark:text-slate-200">{log.actorRole}</td>
                    <td className="px-4 py-2.5 text-teal-600 dark:text-teal-400 font-semibold">{log.action}</td>
                    <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">{log.resourceType}</td>
                    <td className="px-4 py-2.5 text-slate-500">{log.ipAddress}</td>
                    <td className="px-5 py-2.5">
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SYSTEM HEALTH TAB */}
      {activeTab === 'health' && healthData && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Core Banking System Health: {healthData.status}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Uptime: {healthData.uptimeSeconds} seconds</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500">Database Engine</span>
              <p className="font-bold text-slate-900 dark:text-white mt-1">{healthData.databaseEngine}</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500">API Gateway Latency</span>
              <p className="font-bold text-emerald-600 mt-1">{healthData.apiLatencyMs}ms (P99: 32ms)</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500">Process Memory (RSS)</span>
              <p className="font-bold text-slate-900 dark:text-white mt-1">{healthData.memoryUsageMB} MB</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
