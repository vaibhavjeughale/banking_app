import React from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, Building2, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Transaction } from '../types';

interface ReceiptModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const isDeposit = transaction.type === 'DEPOSIT' || transaction.type === 'INTEREST';
  const amountFormatted = `$${(transaction.amountCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const textContent = `
========================================
       NEXABANK AI OFFICIAL RECEIPT
========================================
Reference: ${transaction.transactionReference}
Timestamp: ${new Date(transaction.createdAt).toUTCString()}
Status:    ${transaction.status}
Type:      ${transaction.type}
Category:  ${transaction.category}
Amount:    ${isDeposit ? '+' : '-'}${amountFormatted} USD
Fee:       $0.00 USD
Description: ${transaction.description}
Beneficiary: ${transaction.beneficiaryName || 'Self / Authorized Recipient'}
========================================
Clearing: FedNow / NexaInstant High-Velocity Rail
Verification: NB-SEC-${transaction.transactionReference.slice(-6)}
========================================
    `;
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt_${transaction.transactionReference}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs tracking-wider">
              NB
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Official Transaction Receipt</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">NexaBank AI Global Clearing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Content */}
        <div className="p-6 space-y-6">
          <div className="text-center py-2">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${isDeposit ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'}`}>
              {isDeposit ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
            </div>
            <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {isDeposit ? '+' : '-'}{amountFormatted}
            </div>
            <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1.5 mt-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{transaction.status} · Settlement Verified</span>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Transaction Reference</span>
              <span className="font-mono font-medium text-slate-900 dark:text-slate-100 select-all">{transaction.transactionReference}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Timestamp</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">{new Date(transaction.createdAt).toLocaleString()}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Transaction Category</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">{transaction.category}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Recipient / Payee</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">{transaction.beneficiaryName || 'Self / Internal Ledger'}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Transfer Description</span>
              <span className="font-medium text-slate-900 dark:text-slate-100 text-right max-w-xs truncate">{transaction.description}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Transaction Fee</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">$0.00 (Zero Fee Sandbox)</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg flex items-center gap-3 border border-slate-200/60 dark:border-slate-800">
            <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
            <div className="text-[11px] text-slate-600 dark:text-slate-300">
              <p className="font-semibold text-slate-800 dark:text-slate-100">Cryptographically Signed Ledger Entry</p>
              <p className="text-slate-500 dark:text-slate-400">Verified through NexaBank High-Velocity Clearing. Idempotency guaranteed.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Statement</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-700 rounded-lg transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
