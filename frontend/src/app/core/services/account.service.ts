import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Account, AccountSummary } from '../models/account.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http = inject(HttpClient);

  // Angular Signals for reactive account portfolios
  accounts = signal<Account[]>([]);
  isLoading = signal<boolean>(false);

  // Computed signals
  totalAvailableCents = computed(() =>
    this.accounts().reduce((sum, a) => sum + a.availableBalanceCents, 0)
  );

  totalLedgerCents = computed(() =>
    this.accounts().reduce((sum, a) => sum + a.ledgerBalanceCents, 0)
  );

  totalAvailableFormatted = computed(() =>
    `$${(this.totalAvailableCents() / 100).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`
  );

  totalLedgerFormatted = computed(() =>
    `$${(this.totalLedgerCents() / 100).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`
  );

  checkingAccount = computed(() =>
    this.accounts().find((a) => a.accountType === 'CHECKING')
  );

  savingsAccount = computed(() =>
    this.accounts().find((a) => a.accountType === 'SAVINGS')
  );

  loadAccounts(): Observable<{ accounts: Account[] }> {
    this.isLoading.set(true);
    return this.http.get<{ accounts: Account[] }>('/api/v1/accounts').pipe(
      tap({
        next: (res) => {
          this.accounts.set(res.accounts);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      })
    );
  }

  getAccountSummary(accountId: string): Observable<AccountSummary> {
    return this.http.get<AccountSummary>(`/api/v1/accounts/${accountId}/summary`);
  }

  updateNickname(accountId: string, nickname: string): Observable<{ success: boolean; account: Account }> {
    return this.http.patch<{ success: boolean; account: Account }>(`/api/v1/accounts/${accountId}/nickname`, {
      nickname
    }).pipe(
      tap((res) => {
        this.accounts.update((prev) =>
          prev.map((a) => (a.id === accountId ? res.account : a))
        );
      })
    );
  }

  // Update account locally after committed transaction event
  updateAccountState(updatedAccount: Account): void {
    this.accounts.update((prev) =>
      prev.map((a) => (a.id === updatedAccount.id ? updatedAccount : a))
    );
  }
}
