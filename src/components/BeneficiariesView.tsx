import React, { useState } from 'react';
import { Users, Plus, ShieldCheck, Clock, Trash2, Building2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Beneficiary } from '../types';

interface BeneficiariesViewProps {
  beneficiaries: Beneficiary[];
  onAddBeneficiary: (data: {
    displayName: string;
    accountNumber: string;
    bankName: string;
    routingCode?: string;
  }) => Promise<{ success: boolean; beneficiary?: Beneficiary; error?: string }>;
  onDeleteBeneficiary: (id: string) => Promise<void>;
  onSelectPayeeForTransfer: (benId: string) => void;
}

export const BeneficiariesView: React.FC<BeneficiariesViewProps> = ({
  beneficiaries,
  onAddBeneficiary,
  onDeleteBeneficiary,
  onSelectPayeeForTransfer
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('JPMorgan Chase Bank, N.A.');
  const [routingCode, setRoutingCode] = useState('021000021');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await onAddBeneficiary({
      displayName: displayName.trim(),
      accountNumber: accountNumber.trim(),
      bankName: bankName.trim(),
      routingCode: routingCode.trim()
    });

    setIsSubmitting(false);
    if (res.success) {
      setShowAddModal(false);
      setDisplayName('');
      setAccountNumber('');
    } else {
      setErrorMsg(res.error || 'Failed to register payee.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Beneficiary Payees Directory
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Authorized wire recipients with AML verification and cooling-off safeguards
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Beneficiary</span>
        </button>
      </div>

      {/* Beneficiaries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {beneficiaries.map((b) => {
          const isCoolingOff = b.coolingOffUntil && new Date(b.coolingOffUntil).getTime() > Date.now();
          return (
            <div
              key={b.id}
              className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-sm">
                    <Building2 className="w-5 h-5" />
                  </div>
                  {isCoolingOff ? (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                      <Clock className="w-3 h-3" />
                      <span>Security Cooldown</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified Active</span>
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {b.displayName}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{b.bankName}</p>
                  <p className="text-xs font-mono text-slate-700 dark:text-slate-300 mt-2 font-medium">
                    {b.maskedAccountNumber} · ABA {b.routingCode}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => onSelectPayeeForTransfer(b.id)}
                  disabled={Boolean(isCoolingOff)}
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Transfer Money →
                </button>
                <button
                  onClick={() => onDeleteBeneficiary(b.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Deactivate Payee"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Beneficiary Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Register Beneficiary Payee</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Payee Display Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apex Global Suppliers LLC"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Account Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9840291840"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Receiving Bank Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. JPMorgan Chase Bank, N.A."
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Routing Transit Number (ABA / SWIFT)
                </label>
                <input
                  type="text"
                  placeholder="021000021"
                  value={routingCode}
                  onChange={(e) => setRoutingCode(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-700 dark:text-amber-300">
                  <strong>Cooling-off Policy:</strong> Newly registered payees have a mandatory 2-hour transfer cooldown window to protect against unauthorized account takeover.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white"
                >
                  {isSubmitting ? 'Registering...' : 'Save Beneficiary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
