import React, { useState } from 'react';
import {
  ArrowRightLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  Wallet,
  ArrowRight,
  Printer,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { Account, Beneficiary, Transaction, TransactionCategory } from '../types';

interface TransfersViewProps {
  accounts: Account[];
  beneficiaries: Beneficiary[];
  onExecuteTransfer: (payload: {
    sourceAccountId: string;
    destinationAccountId?: string;
    beneficiaryId?: string;
    customBeneficiary?: { displayName: string; accountNumber: string; bankName: string };
    amountCents: number;
    description: string;
    category?: TransactionCategory;
    idempotencyKey?: string;
  }) => Promise<{ success: boolean; transaction?: Transaction; error?: string }>;
  onViewReceipt: (txn: Transaction) => void;
}

export const TransfersView: React.FC<TransfersViewProps> = ({
  accounts,
  beneficiaries,
  onExecuteTransfer,
  onViewReceipt
}) => {
  // Transfer Form State
  const [sourceAccountId, setSourceAccountId] = useState<string>(accounts[0]?.id || '');
  const [recipientType, setRecipientType] = useState<'beneficiary' | 'own_account' | 'custom'>('beneficiary');
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<string>(beneficiaries[0]?.id || '');
  const [destinationAccountId, setDestinationAccountId] = useState<string>(accounts[1]?.id || '');

  // Custom Recipient Fields
  const [customName, setCustomName] = useState('');
  const [customAccount, setCustomAccount] = useState('');
  const [customBank, setCustomBank] = useState('');

  // Amount & Metadata
  const [amountInput, setAmountInput] = useState<string>('250.00');
  const [description, setDescription] = useState<string>('Contractor Consulting Retainer');
  const [category, setCategory] = useState<TransactionCategory>('Transfers');

  // Multi-step workflow: 'form' | 'confirm' | 'success'
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [completedTxn, setCompletedTxn] = useState<Transaction | null>(null);

  const selectedSourceAccount = accounts.find((a) => a.id === sourceAccountId) || accounts[0];
  const amountFloat = parseFloat(amountInput) || 0;
  const amountCents = Math.round(amountFloat * 100);

  const isInsufficientFunds = selectedSourceAccount && amountCents > selectedSourceAccount.availableBalanceCents;

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (amountCents <= 0) {
      setErrorMsg('Please enter a positive transfer amount.');
      return;
    }

    if (isInsufficientFunds) {
      setErrorMsg(`Insufficient funds. Your available balance is $${(selectedSourceAccount.availableBalanceCents / 100).toFixed(2)}.`);
      return;
    }

    if (recipientType === 'custom' && (!customName || !customAccount || !customBank)) {
      setErrorMsg('Please provide recipient name, account number, and bank name.');
      return;
    }

    if (recipientType === 'own_account' && sourceAccountId === destinationAccountId) {
      setErrorMsg('Source and destination accounts must be different for internal transfers.');
      return;
    }

    setStep('confirm');
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const idempotencyKey = `nb_idemp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      const payload: any = {
        sourceAccountId,
        amountCents,
        description,
        category,
        idempotencyKey
      };

      if (recipientType === 'beneficiary') {
        payload.beneficiaryId = selectedBeneficiaryId;
      } else if (recipientType === 'own_account') {
        payload.destinationAccountId = destinationAccountId;
      } else {
        payload.customBeneficiary = {
          displayName: customName,
          accountNumber: customAccount,
          bankName: customBank
        };
      }

      const res = await onExecuteTransfer(payload);
      if (res.success && res.transaction) {
        setCompletedTxn(res.transaction);
        setStep('success');
      } else {
        setErrorMsg(res.error || 'Transfer failed to commit.');
        setStep('form');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during transfer.');
      setStep('form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep('form');
    setCompletedTxn(null);
    setAmountInput('100.00');
    setDescription('');
    setErrorMsg(null);
  };

  const categories: TransactionCategory[] = [
    'Transfers',
    'Utilities & Bills',
    'Groceries',
    'Dining & Restaurants',
    'Shopping & Retail',
    'Travel & Transit',
    'Subscriptions',
    'Miscellaneous'
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Step Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Atomic Money Transfer
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Simulated instant wire transfer with idempotency protection and atomic ledger commit
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-700 dark:text-rose-300">
            <p className="font-semibold">Transfer Validation Alert</p>
            <p className="mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* STEP 1: FORM */}
      {step === 'form' && (
        <form onSubmit={handleReview} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          {/* Source Account Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Funding Source Account
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {accounts.map((acc) => {
                const isSelected = acc.id === sourceAccountId;
                return (
                  <div
                    key={acc.id}
                    onClick={() => setSourceAccountId(acc.id)}
                    className={`p-3.5 rounded-xl cursor-pointer border transition ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/50 dark:bg-teal-950/30 ring-1 ring-teal-600'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {acc.nickname || acc.accountType}
                      </span>
                      <Wallet className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1">
                      {acc.maskedAccountNumber}
                    </p>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-2">
                      Available: ${(acc.availableBalanceCents / 100).toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Destination Type Toggle */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Transfer Destination
            </label>
            <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 text-xs">
              <button
                type="button"
                onClick={() => setRecipientType('beneficiary')}
                className={`flex-1 py-1.5 rounded-md font-medium transition ${
                  recipientType === 'beneficiary'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Saved Payee
              </button>
              <button
                type="button"
                onClick={() => setRecipientType('own_account')}
                className={`flex-1 py-1.5 rounded-md font-medium transition ${
                  recipientType === 'own_account'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                My Accounts
              </button>
              <button
                type="button"
                onClick={() => setRecipientType('custom')}
                className={`flex-1 py-1.5 rounded-md font-medium transition ${
                  recipientType === 'custom'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                New Wire Payee
              </button>
            </div>
          </div>

          {/* Conditional Destination Selection */}
          {recipientType === 'beneficiary' && (
            <div className="space-y-1.5">
              <label className="text-xs text-slate-500 dark:text-slate-400">Select Beneficiary</label>
              <select
                value={selectedBeneficiaryId}
                onChange={(e) => setSelectedBeneficiaryId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              >
                {beneficiaries.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.displayName} ({b.bankName} - {b.maskedAccountNumber}) {b.coolingOffUntil ? '⚠️ Cooldown' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {recipientType === 'own_account' && (
            <div className="space-y-1.5">
              <label className="text-xs text-slate-500 dark:text-slate-400">Target Account</label>
              <select
                value={destinationAccountId}
                onChange={(e) => setDestinationAccountId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              >
                {accounts
                  .filter((a) => a.id !== sourceAccountId)
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nickname || a.accountType} ({a.maskedAccountNumber}) - ${(a.availableBalanceCents / 100).toFixed(2)}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {recipientType === 'custom' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Recipient Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Liam Reynolds LLC"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Account Number</label>
                <input
                  type="text"
                  placeholder="e.g. 5892019482"
                  value={customAccount}
                  onChange={(e) => setCustomAccount(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Bank Name</label>
                <input
                  type="text"
                  placeholder="e.g. Citibank N.A."
                  value={customBank}
                  onChange={(e) => setCustomBank(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  required
                />
              </div>
            </div>
          )}

          {/* Amount Input & Presets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Transfer Amount (USD)
              </label>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Available: ${(selectedSourceAccount?.availableBalanceCents / 100 || 0).toFixed(2)}
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">$</span>
              <input
                type="number"
                step="0.01"
                min="1"
                max="500000"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className={`w-full pl-8 pr-4 py-3 text-xl font-bold rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 ${
                  isInsufficientFunds
                    ? 'border-rose-500 focus:ring-rose-500 text-rose-600'
                    : 'border-slate-300 dark:border-slate-700 focus:ring-teal-500'
                }`}
                required
              />
            </div>

            {/* Quick Amounts */}
            <div className="flex gap-2 pt-1">
              {['50', '100', '250', '500', '1000'].map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setAmountInput(val + '.00')}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
                >
                  ${val}
                </button>
              ))}
            </div>
          </div>

          {/* Category & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Reference / Memo</label>
              <input
                type="text"
                placeholder="e.g. Invoice #9024 payment"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isInsufficientFunds}
              className="w-full py-3 px-4 rounded-xl font-semibold text-xs text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition flex items-center justify-center gap-2"
            >
              <span>Review Transfer Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: CONFIRMATION SCREEN */}
      {step === 'confirm' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 text-xs font-semibold uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>Step 2 of 2: Security & Settlement Verification</span>
          </div>

          <div className="text-center py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400">Total Outgoing Debit</span>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              ${(amountCents / 100).toFixed(2)} <span className="text-sm font-semibold text-slate-500">USD</span>
            </h3>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
              Zero transfer fees (NexaInstant Rail)
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Source Account</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {selectedSourceAccount.nickname} ({selectedSourceAccount.maskedAccountNumber})
              </span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Recipient</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {recipientType === 'beneficiary'
                  ? beneficiaries.find((b) => b.id === selectedBeneficiaryId)?.displayName
                  : recipientType === 'own_account'
                  ? accounts.find((a) => a.id === destinationAccountId)?.nickname
                  : customName}
              </span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Transaction Category</span>
              <span className="font-medium text-slate-900 dark:text-white">{category}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Description Memo</span>
              <span className="font-medium text-slate-900 dark:text-white">{description || 'Wire Transfer'}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Estimated Settlement</span>
              <span className="font-semibold text-teal-600 dark:text-teal-400">Instant (Sub-second FedNow)</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep('form')}
              disabled={isSubmitting}
              className="flex-1 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Modify Details
            </button>
            <button
              type="button"
              onClick={handleConfirmSubmit}
              disabled={isSubmitting}
              className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Executing Atomic Commit...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Execute Transfer Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SUCCESS CONFIRMATION */}
      {step === 'success' && completedTxn && (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Transfer Committed Successfully!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Funds have been debited from your ledger and routed instantly.
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl max-w-md mx-auto text-xs space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-slate-500">Transaction Reference:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white select-all">
                {completedTxn.transactionReference}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Amount Sent:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                ${(completedTxn.amountCents / 100).toFixed(2)} USD
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Recipient:</span>
              <span className="font-medium text-slate-900 dark:text-white">{completedTxn.beneficiaryName}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onViewReceipt(completedTxn)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <Printer className="w-4 h-4" />
              <span>View Official Receipt</span>
            </button>
            <button
              onClick={resetForm}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Make Another Transfer</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
