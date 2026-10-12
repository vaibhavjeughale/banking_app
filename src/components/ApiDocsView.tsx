import React, { useState, useEffect } from 'react';
import { FileCode2, Copy, Check, Terminal, ExternalLink, ShieldCheck, Database, Layers } from 'lucide-react';
import { api } from '../services/api';

export const ApiDocsView: React.FC = () => {
  const [spec, setSpec] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.getOpenApiSpec().then((data) => setSpec(data)).catch(console.error);
  }, []);

  const copySpec = () => {
    if (!spec) return;
    navigator.clipboard.writeText(JSON.stringify(spec, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Architecture, OpenAPI Spec & Developer Reference
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            MEAN Stack, Reactive Standalone Patterns, Decimal Minor Unit Arithmetic, and GenAI Safeguards
          </p>
        </div>

        <button
          onClick={copySpec}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied OpenAPI JSON' : 'Copy OpenAPI v3 Spec'}</span>
        </button>
      </div>

      {/* System Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white">Reactive Architecture</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Frontend leverages fine-grained Signals and RxJS event pipelines. Server-Sent Events push committed ledger transitions directly into UI state without manual polling.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
            <Database className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white">Integer Minor Unit Arithmetic</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            All monetary figures are calculated and persisted in integer cents (e.g. 1000 = $10.00). Eliminates binary floating point drift and guarantees auditable accuracy.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white">GenAI Prompt Enclosure</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            AI Assistant is strictly bounded to read-only tool calling functions. Account numbers are masked, prompts sanitized, and writes prohibited.
          </p>
        </div>
      </div>

      {/* OpenAPI Live Spec Viewer */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">RESTful Endpoints Explorer (/api/v1)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Live schema inspection retrieved from /api/v1/docs</p>
          </div>
          <span className="font-mono text-xs text-teal-600 dark:text-teal-400 font-bold">OpenAPI 3.0.3</span>
        </div>

        <div className="space-y-3">
          {[
            { method: 'POST', path: '/api/v1/auth/login', desc: 'Authenticate credentials, returns JWT bearer token' },
            { method: 'GET', path: '/api/v1/accounts', desc: 'Query checking and savings balances for current user' },
            { method: 'POST', path: '/api/v1/transfers', desc: 'Execute atomic money transfer with idempotency key' },
            { method: 'GET', path: '/api/v1/transactions', desc: 'Filter, sort, and paginate ledger transaction records' },
            { method: 'GET', path: '/api/v1/beneficiaries', desc: 'Retrieve registered wire payees with cooldown indicators' },
            { method: 'POST', path: '/api/v1/ai/chat', desc: 'Invoke read-only GenAI banking assistant' },
            { method: 'GET', path: '/api/v1/events', desc: 'Server-Sent Events (SSE) live push feed' }
          ].map((ep, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    ep.method === 'POST'
                      ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                      : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  {ep.method}
                </span>
                <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white">{ep.path}</span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">{ep.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
