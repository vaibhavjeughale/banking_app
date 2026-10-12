import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  Transaction,
  TransferRequest,
  OfficialReceipt
} from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private http = inject(HttpClient);

  // Angular Signals
  transactions = signal<Transaction[]>([]);
  totalCount = signal<number>(0);
  currentPage = signal<number>(1);
  pageSize = signal<number>(20);
  isLoading = signal<boolean>(false);

  loadTransactions(filters: Record<string, string> = {}): Observable<{
    transactions: Transaction[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }> {
    this.isLoading.set(true);
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params = params.set(k, v);
    });

    return this.http
      .get<{
        transactions: Transaction[];
        pagination: { total: number; page: number; limit: number; totalPages: number };
      }>('/api/v1/transactions', { params })
      .pipe(
        tap({
          next: (res) => {
            this.transactions.set(res.transactions);
            this.totalCount.set(res.pagination.total);
            this.currentPage.set(res.pagination.page);
            this.isLoading.set(false);
          },
          error: () => this.isLoading.set(false)
        })
      );
  }

  executeTransfer(request: TransferRequest): Observable<{
    success: boolean;
    message: string;
    transaction: Transaction;
  }> {
    // Generate unique idempotency key if not provided
    const idempotencyKey =
      request.idempotencyKey ||
      `nb_idemp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const payload = { ...request, idempotencyKey };

    return this.http
      .post<{ success: boolean; message: string; transaction: Transaction }>(
        '/api/v1/transfers',
        payload
      )
      .pipe(
        tap((res) => {
          if (res.success && res.transaction) {
            this.transactions.update((prev) => [res.transaction, ...prev]);
          }
        })
      );
  }

  getReceipt(transactionId: string): Observable<{ receipt: OfficialReceipt }> {
    return this.http.get<{ receipt: OfficialReceipt }>(
      `/api/v1/transactions/${transactionId}/receipt`
    );
  }

  downloadCsvStatement(): void {
    window.location.href = '/api/v1/transactions/export/csv';
  }

  // Prepend real-time transaction event
  prependRealtimeTransaction(newTxn: Transaction): void {
    this.transactions.update((prev) => [newTxn, ...prev.filter((t) => t.id !== newTxn.id)]);
  }
}
