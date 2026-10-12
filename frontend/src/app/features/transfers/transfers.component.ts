import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { BankingService } from '../../core/services/banking.service';
import { Transaction } from '../../core/models/banking.models';

@Component({
  selector: 'app-transfers',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './transfers.component.html',
  styleUrl: './transfers.component.css'
})
export class TransfersComponent {
  bankingService = inject(BankingService);
  private fb = inject(FormBuilder);

  // Multi-step: 'form' | 'confirm' | 'success'
  step = signal<'form' | 'confirm' | 'success'>('form');
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  completedTransaction = signal<Transaction | null>(null);

  // Reactive Form
  transferForm = this.fb.group({
    sourceAccountId: ['', Validators.required],
    recipientType: ['beneficiary', Validators.required],
    beneficiaryId: [''],
    destinationAccountId: [''],
    amount: [100.00, [Validators.required, Validators.min(1), Validators.max(500000)]],
    category: ['Transfers', Validators.required],
    description: ['Consulting retainer wire', Validators.required]
  });

  selectedSourceAccount = computed(() => {
    const accId = this.transferForm.get('sourceAccountId')?.value;
    return this.bankingService.accounts().find((a) => a.id === accId) || this.bankingService.accounts()[0];
  });

  constructor() {
    // Set default source account once loaded
    const firstAcc = this.bankingService.accounts()[0];
    if (firstAcc) {
      this.transferForm.patchValue({ sourceAccountId: firstAcc.id });
    }
    const firstBen = this.bankingService.beneficiaries()[0];
    if (firstBen) {
      this.transferForm.patchValue({ beneficiaryId: firstBen.id });
    }
  }

  setPresetAmount(val: number): void {
    this.transferForm.patchValue({ amount: val });
  }

  proceedToConfirm(): void {
    this.errorMessage.set(null);
    if (this.transferForm.invalid) {
      this.errorMessage.set('Please fill out all required fields with valid amounts.');
      return;
    }

    const amountFloat = Number(this.transferForm.get('amount')?.value) || 0;
    const amountCents = Math.round(amountFloat * 100);
    const sourceAcc = this.selectedSourceAccount();

    if (sourceAcc && amountCents > sourceAcc.availableBalanceCents) {
      this.errorMessage.set(
        `Insufficient available funds. You have $${(sourceAcc.availableBalanceCents / 100).toFixed(2)} available.`
      );
      return;
    }

    this.step.set('confirm');
  }

  executeTransfer(): void {
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const formVal = this.transferForm.value;
    const amountCents = Math.round(Number(formVal.amount) * 100);
    const idempotencyKey = `nb_ang_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const payload: any = {
      sourceAccountId: formVal.sourceAccountId,
      amountCents,
      description: formVal.description,
      category: formVal.category,
      idempotencyKey
    };

    if (formVal.recipientType === 'beneficiary') {
      payload.beneficiaryId = formVal.beneficiaryId;
    } else {
      payload.destinationAccountId = formVal.destinationAccountId;
    }

    this.bankingService.executeTransfer(payload).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.success && res.transaction) {
          this.completedTransaction.set(res.transaction);
          this.step.set('success');
        } else {
          this.errorMessage.set(res.message || 'Transfer failed.');
          this.step.set('form');
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.error || err.error?.message || 'Transfer rejected by banking gateway.');
        this.step.set('form');
      }
    });
  }

  resetForm(): void {
    this.step.set('form');
    this.completedTransaction.set(null);
    this.errorMessage.set(null);
  }
}
