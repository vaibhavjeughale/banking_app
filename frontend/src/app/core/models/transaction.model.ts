export type TransactionType = 'TRANSFER' | 'DEPOSIT' | 'WITHDRAWAL' | 'BILL_PAY' | 'INTEREST';
export type TransactionStatus = 'COMPLETED' | 'PENDING' | 'FAILED' | 'REVERSED';
export type TransactionCategory =
  | 'Income & Salary'
  | 'Groceries'
  | 'Dining & Restaurants'
  | 'Utilities & Bills'
  | 'Subscriptions'
  | 'Shopping & Retail'
  | 'Travel & Transit'
  | 'Healthcare'
  | 'Transfers'
  | 'Miscellaneous';

export interface Transaction {
  id: string;
  transactionReference: string;
  sourceAccountId?: string;
  destinationAccountId?: string;
  beneficiaryReference?: string;
  beneficiaryName?: string;
  ownerId: string;
  type: TransactionType;
  amountCents: number;
  feeCents: number;
  currency: string;
  status: TransactionStatus;
  category: TransactionCategory;
  description: string;
  idempotencyKey?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TransferRequest {
  sourceAccountId: string;
  destinationAccountId?: string;
  beneficiaryId?: string;
  customBeneficiary?: {
    displayName: string;
    accountNumber: string;
    bankName: string;
  };
  amountCents: number;
  description: string;
  category?: TransactionCategory;
  idempotencyKey?: string;
}

export interface OfficialReceipt {
  institution: string;
  transactionReference: string;
  timestamp: string;
  status: TransactionStatus;
  amount: string;
  currency: string;
  type: TransactionType;
  category: TransactionCategory;
  sourceAccount: string;
  recipient: string;
  description: string;
  fee: string;
  verificationCode: string;
  clearingNetwork: string;
}
