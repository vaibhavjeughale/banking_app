import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BankingService } from '../../core/services/banking.service';

@Component({
  selector: 'app-beneficiaries',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './beneficiaries.component.html',
  styleUrl: './beneficiaries.component.css'
})
export class BeneficiariesComponent {
  bankingService = inject(BankingService);

  showAddModal = signal<boolean>(false);
  name = signal<string>('');
  accountNumber = signal<string>('');
  bankName = signal<string>('JPMorgan Chase Bank, N.A.');
  routingCode = signal<string>('021000021');

  addPayee(): void {
    if (!this.name() || !this.accountNumber()) return;

    this.bankingService
      .addBeneficiary({
        displayName: this.name(),
        accountNumber: this.accountNumber(),
        bankName: this.bankName(),
        routingCode: this.routingCode()
      })
      .subscribe({
        next: () => {
          this.showAddModal.set(false);
          this.name.set('');
          this.accountNumber.set('');
        }
      });
  }

  deletePayee(id: string): void {
    this.bankingService.deleteBeneficiary(id).subscribe();
  }
}
