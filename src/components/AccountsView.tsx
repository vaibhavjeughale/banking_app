import React, { useState } from 'react';
import { Wallet, ShieldCheck, ArrowRightLeft, CreditCard, Sparkles, Check, Edit2 } from 'lucide-react';
import { Account } from '../types';

interface AccountsViewProps {
  accounts: Account[];
  onOpenTransfer: () => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({ accounts, onOpenTransfer }) => {
  const [selectedAccId, setSelectedAccId] = useState<string>(accounts[0]?.id || '');
  const selectedAcc = accounts.find((a) => a.id === selectedAccId) || accounts[0];

  const fmt = (cents: number) =>
    `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Accounts & Portfolios
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            FDIC-insured deposit accounts under NexaBank AI Global Custody
          </p>
        </div>
        <button
          onClick={onOpenTransfer}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition"
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Move Money</span>
        </button>
      </div>

      {/* Account Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.map((acc) => {
          const isSelected = acc.id === selectedAccId;
          const isSavings = acc.accountType === 'SAVINGS';

          return (
            <div
              key={acc.id}
              onClick={() => setSelectedAccId(acc.id)}
              className={`p-6 rounded-2xl cursor-pointer transition-all border ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-lg ring-2 ring-teal-500'
                  : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span
                    className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded ${
                      isSelected
                        ? 'bg-teal-500 text-slate-950'
                        : 'bg-slate-100 dark:bg-slate-800 text-teal-600 dark:text-teal-400'
                    }`}
                  >
                    {acc.accountType} {isSavings && '· 4.75% APY'}
                  </span>
                  <h3 className="text-base font-bold mt-2">{acc.nickname || acc.accountType}</h3>
                  <p
                    className={`text-xs font-mono mt-1 ${
                      isSelected ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {acc.maskedAccountNumber} · Active FedNow
                  </p>
                </div>
                <CreditCard className={`w-6 h-6 ${isSelected ? 'text-teal-400' : 'text-slate-400'}`} />
              </div>

              <div className="mt-8 flex items-baseline justify-between pt-4 border-t border-slate-800/20 dark:border-slate-800">
                <div>
                  <p
                    className={`text-[10px] uppercase font-medium ${
                      isSelected ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    Available
                  </p>
                  <p className="text-2xl font-black tracking-tight">{fmt(acc.availableBalanceCents)}</p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-[10px] uppercase font-medium ${
                      isSelected ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    Ledger
                  </p>
                  <p
                    className={`text-sm font-semibold ${
                      isSelected ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {fmt(acc.ledgerBalanceCents)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Account Deep Details */}
      {selectedAcc && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Account Specifications: {selectedAcc.nickname || selectedAcc.accountType}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Routing details and security configuration
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Security Audited</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">Routing Number (ABA)</span>
              <p className="font-mono font-bold text-slate-900 dark:text-white mt-1">021000021</p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">Account Number</span>
              <p className="font-mono font-bold text-slate-900 dark:text-white mt-1">
                {selectedAcc.maskedAccountNumber}
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">Currency Base</span>
              <p className="font-bold text-slate-900 dark:text-white mt-1">USD ($ - United States Dollar)</p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">Clearing Rail</span>
              <p className="font-bold text-teal-600 dark:text-teal-400 mt-1">NexaInstant / FedNow High-Velocity</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 dark:text-slate-300">
              <p className="font-semibold text-slate-900 dark:text-slate-100">Intelligent Liquidity Sweep</p>
              <p className="mt-0.5 leading-relaxed">
                Excess checking balances over $10,000 are eligible for automatic high-yield reserve sweep earning 4.75% annual percentage yield without locking up liquidity.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
