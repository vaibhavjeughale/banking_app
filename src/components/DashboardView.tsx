import React from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  TrendingUp,
  ReceiptText,
  Bot,
  Users,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { Account, Transaction } from '../types';

interface DashboardViewProps {
  accounts: Account[];
  transactions: Transaction[];
  onOpenTransfer: () => void;
  onOpenBeneficiaries: () => void;
  onOpenAssistant: () => void;
  onOpenTransactions: () => void;
  onSelectTransaction: (txn: Transaction) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  accounts,
  transactions,
  onOpenTransfer,
  onOpenBeneficiaries,
  onOpenAssistant,
  onOpenTransactions,
  onSelectTransaction
}) => {
  // Aggregate Metrics
  const totalAvailableCents = accounts.reduce((sum, a) => sum + a.availableBalanceCents, 0);
  const totalLedgerCents = accounts.reduce((sum, a) => sum + a.ledgerBalanceCents, 0);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let monthlyIncomeCents = 0;
  let monthlyExpenseCents = 0;

  for (const t of transactions) {
    if (t.status !== 'COMPLETED') continue;
    const d = new Date(t.createdAt);
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      if (t.type === 'DEPOSIT' || t.type === 'INTEREST') {
        monthlyIncomeCents += t.amountCents;
      } else {
        monthlyExpenseCents += t.amountCents;
      }
    }
  }

  // Format Helpers
  const fmt = (cents: number) =>
    `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const recentTxns = transactions.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white shadow-md">
        <div>
          <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold tracking-wider uppercase mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>NexaBank Enterprise Clearing Active</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Welcome back, Alex Morgan</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            All systems nominal. Your multi-account ledger is synced across the FedNow instantaneous settlement rail.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenTransfer}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Send Money</span>
          </button>
          <button
            onClick={onOpenAssistant}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Bot className="w-4 h-4 text-teal-400" />
            <span>Ask AI Assistant</span>
          </button>
        </div>
      </div>

      {/* 4 Dashboard Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Available Balance */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Available Balance</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {fmt(totalAvailableCents)}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Ready for immediate transfers
            </p>
          </div>
        </div>

        {/* Ledger (Posted) Balance */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Ledger Balance</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <ReceiptText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {fmt(totalLedgerCents)}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Includes posted settlement items
            </p>
          </div>
        </div>

        {/* Monthly Income */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Monthly Inflow</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              +{fmt(monthlyIncomeCents)}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Salary direct deposits & interest
            </p>
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Monthly Outflow</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              -{fmt(monthlyExpenseCents)}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Wire transfers & debit bill payments
            </p>
          </div>
        </div>
      </div>

      {/* Account Cards Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
            Active Accounts & Portfolios
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {accounts.length} linked accounts
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 tracking-wider uppercase">
                    {acc.accountType}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {acc.nickname || acc.accountType}
                  </h4>
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
                    {acc.maskedAccountNumber}
                  </p>
                </div>

                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-end justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-medium">Available Balance</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                    {fmt(acc.availableBalanceCents)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase font-medium">Ledger Balance</p>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
                    {fmt(acc.ledgerBalanceCents)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions & Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Transactions Table */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                Recent Transactions
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any transaction row to inspect and print official receipt
              </p>
            </div>
            <button
              onClick={onOpenTransactions}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
            >
              View All History →
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
            {recentTxns.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-500">No recent transactions.</p>
            ) : (
              recentTxns.map((t) => {
                const isDeposit = t.type === 'DEPOSIT' || t.type === 'INTEREST';
                return (
                  <div
                    key={t.id}
                    onClick={() => onSelectTransaction(t)}
                    className="flex items-center justify-between py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg px-2 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isDeposit
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {isDeposit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {t.description}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {t.category}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-3">
                      <p
                        className={`text-xs font-bold ${
                          isDeposit
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {isDeposit ? '+' : '-'}{fmt(t.amountCents)}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        {t.status}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 1 Col: Quick Actions & Assistant Card */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <h4 className="text-xs font-bold tracking-tight text-slate-900 dark:text-white uppercase mb-3">
              Quick Operations
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={onOpenTransfer}
                className="p-3 text-left rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-teal-50 dark:hover:bg-slate-800 hover:border-teal-500 border border-slate-200/80 dark:border-slate-700/80 transition group"
              >
                <ArrowRightLeft className="w-4 h-4 text-teal-600 dark:text-teal-400 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Send Wire</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Atomic instant</p>
              </button>

              <button
                onClick={onOpenBeneficiaries}
                className="p-3 text-left rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-teal-50 dark:hover:bg-slate-800 hover:border-teal-500 border border-slate-200/80 dark:border-slate-700/80 transition group"
              >
                <Users className="w-4 h-4 text-teal-600 dark:text-teal-400 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Beneficiaries</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Manage payees</p>
              </button>

              <button
                onClick={onOpenTransactions}
                className="p-3 text-left rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-teal-50 dark:hover:bg-slate-800 hover:border-teal-500 border border-slate-200/80 dark:border-slate-700/80 transition group"
              >
                <ReceiptText className="w-4 h-4 text-teal-600 dark:text-teal-400 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Statements</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">CSV & receipts</p>
              </button>

              <button
                onClick={onOpenAssistant}
                className="p-3 text-left rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-teal-50 dark:hover:bg-slate-800 hover:border-teal-500 border border-slate-200/80 dark:border-slate-700/80 transition group"
              >
                <Bot className="w-4 h-4 text-teal-600 dark:text-teal-400 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">AI Advisor</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Spending intel</p>
              </button>
            </div>
          </div>

          {/* AI Callout Widget */}
          <div className="p-5 rounded-xl bg-teal-950/20 dark:bg-teal-950/40 border border-teal-800/40 text-slate-900 dark:text-white">
            <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 text-xs font-bold mb-1">
              <Bot className="w-4 h-4" />
              <span>NexaBank AI Insight</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              You saved <strong>18% more</strong> than last month. Your High-Yield Reserve earned $168.20 in interest!
            </p>
            <button
              onClick={onOpenAssistant}
              className="mt-3 text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 inline-flex items-center gap-1"
            >
              Ask AI about my spending breakdown →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
