import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
  },
  {
    path: 'accounts',
    loadComponent: () =>
      import('./features/accounts/accounts.component').then((m) => m.AccountsComponent)
  },
  {
    path: 'transfers',
    loadComponent: () =>
      import('./features/transfers/transfers.component').then((m) => m.TransfersComponent)
  },
  {
    path: 'beneficiaries',
    loadComponent: () =>
      import('./features/beneficiaries/beneficiaries.component').then((m) => m.BeneficiariesComponent)
  },
  {
    path: 'transactions',
    loadComponent: () =>
      import('./features/transactions/transactions.component').then((m) => m.TransactionsComponent)
  },
  {
    path: 'ai-assistant',
    loadComponent: () =>
      import('./features/ai-assistant/ai-assistant.component').then((m) => m.AiAssistantComponent)
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/admin.component').then((m) => m.AdminComponent)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
