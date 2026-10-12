import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Beneficiary, CreateBeneficiaryRequest } from '../models/beneficiary.model';

@Injectable({
  providedIn: 'root'
})
export class BeneficiaryService {
  private http = inject(HttpClient);

  beneficiaries = signal<Beneficiary[]>([]);
  isLoading = signal<boolean>(false);

  loadBeneficiaries(): Observable<{ beneficiaries: Beneficiary[] }> {
    this.isLoading.set(true);
    return this.http.get<{ beneficiaries: Beneficiary[] }>('/api/v1/beneficiaries').pipe(
      tap({
        next: (res) => {
          this.beneficiaries.set(res.beneficiaries);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      })
    );
  }

  addBeneficiary(request: CreateBeneficiaryRequest): Observable<{
    success: boolean;
    message: string;
    beneficiary: Beneficiary;
  }> {
    return this.http
      .post<{ success: boolean; message: string; beneficiary: Beneficiary }>(
        '/api/v1/beneficiaries',
        request
      )
      .pipe(
        tap((res) => {
          if (res.success && res.beneficiary) {
            this.beneficiaries.update((prev) => [...prev, res.beneficiary]);
          }
        })
      );
  }

  deleteBeneficiary(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`/api/v1/beneficiaries/${id}`).pipe(
      tap((res) => {
        if (res.success) {
          this.beneficiaries.update((prev) => prev.filter((b) => b.id !== id));
        }
      })
    );
  }

  isCoolingOff(beneficiary: Beneficiary): boolean {
    if (!beneficiary.coolingOffUntil) return false;
    return new Date(beneficiary.coolingOffUntil).getTime() > Date.now();
  }
}
