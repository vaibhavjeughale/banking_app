import React, { useState } from 'react';
import { Code2, FileCode, Copy, Check, Sparkles, FolderTree, Layers } from 'lucide-react';

interface ComponentFileSet {
  name: string;
  path: string;
  ts: string;
  html: string;
  css: string;
  description: string;
}

export const AngularExplorerView: React.FC = () => {
  const [selectedComp, setSelectedComp] = useState<string>('app');
  const [activeTab, setActiveTab] = useState<'html' | 'ts' | 'css'>('html');
  const [copied, setCopied] = useState(false);

  const componentFiles: Record<string, ComponentFileSet> = {
    app: {
      name: 'AppComponent (Root Shell)',
      path: 'frontend/src/app/app.component',
      description: 'Root standalone component with Angular 20 Signals, reactive navigation shell, and theme controller.',
      ts: `import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BankingService } from './core/services/banking.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  bankingService = inject(BankingService);

  title = 'NexaBank AI';
  isSidebarOpen = signal<boolean>(false);
  isDarkMode = signal<boolean>(false);
  showPersonaMenu = signal<boolean>(false);

  ngOnInit(): void {
    this.bankingService.loadInitialState();
  }

  toggleSidebar(): void {
    this.isSidebarOpen.update((open) => !open);
  }
}`,
      html: `<div class="app-layout">
  <aside class="sidebar" [class.open]="isSidebarOpen()">
    <div class="sidebar-header">
      <div class="logo-box">NB</div>
      <span class="brand-name">NexaBank</span>
    </div>

    <nav class="sidebar-nav">
      <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">Dashboard</a>
      <a routerLink="/transfers" routerLinkActive="active" class="nav-item">Transfers</a>
      <a routerLink="/accounts" routerLinkActive="active" class="nav-item">Accounts</a>
      <a routerLink="/ai-assistant" routerLinkActive="active" class="nav-item">GenAI Assistant</a>
    </nav>
  </aside>

  <main class="main-shell">
    <router-outlet></router-outlet>
  </main>
</div>`,
      css: `.app-layout {
  display: flex;
  min-height: 100vh;
}
.sidebar {
  width: 260px;
  background: #020617;
  color: #94a3b8;
}
.nav-item.active {
  background: #0d9488;
  color: #ffffff;
}`
    },
    transfers: {
      name: 'TransfersComponent (Atomic Wire Wizard)',
      path: 'frontend/src/app/features/transfers/transfers.component',
      description: 'Multi-step simulated transfer workflow with Reactive Forms, idempotency keys, and available balance guards.',
      ts: `import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { BankingService } from '../../core/services/banking.service';

@Component({
  selector: 'app-transfers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transfers.component.html',
  styleUrl: './transfers.component.css'
})
export class TransfersComponent {
  bankingService = inject(BankingService);
  private fb = inject(FormBuilder);

  step = signal<'form' | 'confirm' | 'success'>('form');
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  transferForm = this.fb.group({
    sourceAccountId: ['', Validators.required],
    amount: [100.00, [Validators.required, Validators.min(1)]],
    description: ['', Validators.required]
  });

  proceedToConfirm(): void {
    if (this.transferForm.invalid) return;
    this.step.set('confirm');
  }

  executeTransfer(): void {
    this.isSubmitting.set(true);
    // Commits to backend ledger...
  }
}`,
      html: `<div class="transfers-container">
  @if (step() === 'form') {
    <form [formGroup]="transferForm" (ngSubmit)="proceedToConfirm()">
      <div class="form-group">
        <label>Funding Account</label>
        <select formControlName="sourceAccountId">
          @for (acc of bankingService.accounts(); track acc.id) {
            <option [value]="acc.id">{{ acc.nickname }} (\${{ (acc.availableBalanceCents / 100).toFixed(2) }})</option>
          }
        </select>
      </div>

      <div class="amount-wrapper">
        <input type="number" formControlName="amount">
      </div>

      <button type="submit">Review Transfer</button>
    </form>
  }

  @if (step() === 'confirm') {
    <div class="confirm-box">
      <h3>Confirm \${{ transferForm.get('amount')?.value }} Outgoing Wire</h3>
      <button (click)="executeTransfer()">Execute Now</button>
    </div>
  }
</div>`,
      css: `.transfers-container {
  max-width: 680px;
  margin: 0 auto;
}
.amount-wrapper input {
  font-size: 1.5rem;
  font-weight: 800;
}`
    },
    dashboard: {
      name: 'DashboardComponent (Portfolio Analytics)',
      path: 'frontend/src/app/features/dashboard/dashboard.component',
      description: 'Reactive dashboard consuming Signals for available vs ledger balances and live transactions.',
      ts: `import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BankingService } from '../../core/services/banking.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  bankingService = inject(BankingService);

  recentTransactions = computed(() => {
    return this.bankingService.transactions().slice(0, 6);
  });
}`,
      html: `<div class="dashboard-page">
  <div class="metrics-grid">
    <div class="metric-card">
      <span>Total Available</span>
      <strong>{{ bankingService.formattedAvailableBalance() }}</strong>
    </div>
  </div>

  <div class="transactions-list">
    @for (t of recentTransactions(); track t.id) {
      <div class="txn-row">
        <span>{{ t.description }}</span>
        <strong>\${{ (t.amountCents / 100).toFixed(2) }}</strong>
      </div>
    }
  </div>
</div>`,
      css: `.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}`
    },
    ai: {
      name: 'AiAssistantComponent (Gemini 3.8 Flash)',
      path: 'frontend/src/app/features/ai-assistant/ai-assistant.component',
      description: 'Generative AI financial advisory component communicating with read-only backend tools.',
      ts: `import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../core/services/ai.service';

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-assistant.component.html',
  styleUrl: './ai-assistant.component.css'
})
export class AiAssistantComponent {
  aiService = inject(AiService);
  inputMessage = signal<string>('');

  submitChat(): void {
    const text = this.inputMessage();
    if (!text.trim()) return;
    this.inputMessage.set('');
    this.aiService.sendMessage(text).subscribe();
  }
}`,
      html: `<div class="chat-container">
  <div class="messages-area">
    @for (msg of aiService.messages(); track msg.id) {
      <div class="message-bubble" [class.user]="msg.sender === 'user'">
        {{ msg.content }}
      </div>
    }
  </div>

  <form (ngSubmit)="submitChat()">
    <input [(ngModel)]="inputMessage" name="msg">
    <button type="submit">Send</button>
  </form>
</div>`,
      css: `.chat-container {
  max-width: 820px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}`
    }
  };

  const curr = componentFiles[selectedComp] || componentFiles.app;

  const copyCode = () => {
    const content = activeTab === 'html' ? curr.html : activeTab === 'ts' ? curr.ts : curr.css;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Full Angular 20 Standalone Architecture
            </h2>
            <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
              SEPARATE .html · .css · .ts
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Complete standalone components with Signals, Reactive Forms, and strict template/style/typescript segregation
          </p>
        </div>

        <button
          onClick={copyCode}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied to Clipboard' : `Copy Current ${activeTab.toUpperCase()}`}</span>
        </button>
      </div>

      {/* Component Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Object.entries(componentFiles).map(([key, item]) => (
          <button
            key={key}
            onClick={() => setSelectedComp(key)}
            className={`p-3 text-left rounded-xl border text-xs transition ${
              selectedComp === key
                ? 'bg-slate-900 text-white border-slate-900 dark:bg-teal-950/40 dark:border-teal-600'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <p className="font-bold truncate">{item.name}</p>
            <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{key}.component.*</p>
          </button>
        ))}
      </div>

      {/* File Inspector Box */}
      <div className="bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        {/* Top File Tab Switcher */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">{curr.path}.</span>
            <span className="text-teal-400 font-bold">{activeTab}</span>
          </div>

          <div className="flex rounded-lg bg-slate-800 p-0.5 text-xs">
            <button
              onClick={() => setActiveTab('html')}
              className={`px-3 py-1 rounded-md font-mono transition ${
                activeTab === 'html' ? 'bg-teal-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              template (.html)
            </button>
            <button
              onClick={() => setActiveTab('css')}
              className={`px-3 py-1 rounded-md font-mono transition ${
                activeTab === 'css' ? 'bg-teal-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              styles (.css)
            </button>
            <button
              onClick={() => setActiveTab('ts')}
              className={`px-3 py-1 rounded-md font-mono transition ${
                activeTab === 'ts' ? 'bg-teal-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              typescript (.ts)
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="p-4 overflow-x-auto text-xs font-mono leading-relaxed">
          <pre className="text-slate-300 whitespace-pre">
            {activeTab === 'html' ? curr.html : activeTab === 'ts' ? curr.ts : curr.css}
          </pre>
        </div>
      </div>

      {/* Architecture Highlights */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
        <h4 className="font-bold text-slate-900 dark:text-white">Angular 20 Architecture Highlights in this Repository:</h4>
        <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
          <li><strong>Separate File Discipline</strong>: Every component maintains discrete <code>.html</code> (template), <code>.css</code> (encapsulated styles), and <code>.ts</code> (business logic) files.</li>
          <li><strong>Angular 20 Signals</strong>: UI state is powered by <code>signal()</code> and <code>computed()</code> primitives for fine-grained reactivity without Zone.js overhead.</li>
          <li><strong>Modern Control Flow</strong>: Templates use native <code>@if</code> and <code>@for</code> blocks with compulsory <code>track</code> expressions instead of legacy <code>*ngIf</code> and <code>*ngFor</code>.</li>
          <li><strong>Standalone Components</strong>: Built with <code>standalone: true</code> and zero NgModules, lazy-loaded via <code>app.routes.ts</code>.</li>
        </ul>
      </div>
    </div>
  );
};
