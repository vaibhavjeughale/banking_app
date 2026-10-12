import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User, Account, Transaction, Beneficiary, Notification } from '../models/banking.models';

@Injectable({
  providedIn: 'root'
})
export class BankingService {
  private http = inject(HttpClient);
  private apiUrl = '/api/v1';

  // --- Angular 20 Reactive Signals ---
  currentUser = signal<User | null>(null);
  accounts = signal<Account[]>([]);
  transactions = signal<Transaction[]>([]);
  beneficiaries = signal<Beneficiary[]>([]);
  notifications = signal<Notification[]>([]);
  unreadNotificationCount = signal<number>(0);

  // Computed signals
  totalAvailableBalanceCents = computed(() => {
    return this.accounts().reduce((sum, acc) => sum + acc.availableBalanceCents, 0);
  });

  totalLedgerBalanceCents = computed(() => {
    return this.accounts().reduce((sum, acc) => sum + acc.ledgerBalanceCents, 0);
  });

  formattedAvailableBalance = computed(() => {
    return `$${(this.totalAvailableBalanceCents() / 100).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  });

  loadInitialState(): void {
    this.http.get<{ user: User }>(`${this.apiUrl}/auth/me`).subscribe({
      next: (res) => this.currentUser.set(res.user),
      error: (err) => console.error('Failed to load user session', err)
    });

    this.getAccounts().subscribe();
    this.getTransactions().subscribe();
    this.getBeneficiaries().subscribe();
    this.getNotifications().subscribe();
  }

  // Accounts
  getAccounts(): Observable<{ accounts: Account[] }> {
    return this.http.get<{ accounts: Account[] }>(`${this.apiUrl}/accounts`).pipe(
      tap((res) => this.accounts.set(res.accounts))
    );
  }

  // Transactions
  getTransactions(params: Record<string, string> = {}): Observable<{ transactions: Transaction[] }> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach((key) => {
      httpParams = httpParams.set(key, params[key]);
    });

    return this.http.get<{ transactions: Transaction[] }>(`${this.apiUrl}/transactions`, { params: httpParams }).pipe(
      tap((res) => this.transactions.set(res.transactions))
    );
  }

  // Atomic Transfer
  executeTransfer(payload: {
    sourceAccountId: string;
    destinationAccountId?: string;
    beneficiaryId?: string;
    customBeneficiary?: { displayName: string; accountNumber: string; bankName: string };
    amountCents: number;
    description: string;
    category?: string;
    idempotencyKey?: string;
  }): Observable<{ success: boolean; transaction: Transaction; message: string }> {
    return this.http.post<{ success: boolean; transaction: Transaction; message: string }>(
      `${this.apiUrl}/transfers`,
      payload
    ).pipe(
      tap((res) => {
        if (res.success && res.transaction) {
          // Prepend transaction reactively
          this.transactions.update((prev) => [res.transaction, ...prev]);
          // Refresh accounts to sync updated balance
          this.getAccounts().subscribe();
        }
      })
    );
  }

  // Beneficiaries
  getBeneficiaries(): Observable<{ beneficiaries: Beneficiary[] }> {
    return this.http.get<{ beneficiaries: Beneficiary[] }>(`${this.apiUrl}/beneficiaries`).pipe(
      tap((res) => this.beneficiaries.set(res.beneficiaries))
    );
  }

  addBeneficiary(payload: {
    displayName: string;
    accountNumber: string;
    bankName: string;
    routingCode?: string;
  }): Observable<{ success: boolean; beneficiary: Beneficiary }> {
    return this.http.post<{ success: boolean; beneficiary: Beneficiary }>(
      `${this.apiUrl}/beneficiaries`,
      payload
    ).pipe(
      tap((res) => {
        if (res.success && res.beneficiary) {
          this.beneficiaries.update((prev) => [...prev, res.beneficiary]);
        }
      })
    );
  }

  deleteBeneficiary(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/beneficiaries/${id}`).pipe(
      tap((res) => {
        if (res.success) {
          this.beneficiaries.update((prev) => prev.filter((b) => b.id !== id));
        }
      })
    );
  }

  // Notifications
  getNotifications(): Observable<{ notifications: Notification[]; unreadCount: number }> {
    return this.http.get<{ notifications: Notification[]; unreadCount: number }>(`${this.apiUrl}/notifications`).pipe(
      tap((res) => {
        this.notifications.set(res.notifications);
        this.unreadNotificationCount.set(res.unreadCount);
      })
    );
  }

  markNotificationRead(id: string): Observable<{ success: boolean }> {
    return this.http.patch<{ success: boolean }>(`${this.apiUrl}/notifications/${id}/read`, {}).pipe(
      tap(() => {
        this.notifications.update((list) =>
          list.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
        );
        this.unreadNotificationCount.update((c) => Math.max(0, c - 1));
      })
    );
  }

  // Demo Persona Switch
  switchDemoPersona(role: string): Observable<{ token: string; user: User }> {
    return this.http.post<{ token: string; user: User }>(`${this.apiUrl}/auth/switch-demo-persona`, { role }).pipe(
      tap((res) => {
        localStorage.setItem('nb_auth_token', res.token);
        this.currentUser.set(res.user);
        this.loadInitialState();
      })
    );
  }
}
