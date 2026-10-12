import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BankingService } from '../../core/services/banking.service';
import { Transaction } from '../../core/models/banking.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  bankingService = inject(BankingService);

  // Computed metrics using Angular 20 Signals
  monthlyInflow = computed(() => {
    return this.bankingService.transactions()
      .filter((t) => t.status === 'COMPLETED' && (t.type === 'DEPOSIT' || t.type === 'INTEREST'))
      .reduce((sum, t) => sum + t.amountCents, 0);
  });

  monthlyOutflow = computed(() => {
    return this.bankingService.transactions()
      .filter((t) => t.status === 'COMPLETED' && t.type !== 'DEPOSIT' && t.type !== 'INTEREST')
      .reduce((sum, t) => sum + t.amountCents, 0);
  });

  recentTransactions = computed(() => {
    return this.bankingService.transactions().slice(0, 6);
  });

  selectedReceipt = computed(() => null as Transaction | null);

  formatCents(cents: number): string {
    return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}
