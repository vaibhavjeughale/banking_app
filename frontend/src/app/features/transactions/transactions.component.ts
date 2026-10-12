import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BankingService } from '../../core/services/banking.service';
import { Transaction } from '../../core/models/banking.models';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.css'
})
export class TransactionsComponent {
  bankingService = inject(BankingService);

  searchQuery = signal<string>('');
  selectedCategory = signal<string>('ALL');

  filteredTransactions = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const cat = this.selectedCategory();

    return this.bankingService.transactions().filter((t) => {
      if (q && !t.description.toLowerCase().includes(q) && !t.transactionReference.toLowerCase().includes(q)) {
        return false;
      }
      if (cat !== 'ALL' && t.category !== cat) {
        return false;
      }
      return true;
    });
  });

  formatCents(cents: number): string {
    return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  }
}
