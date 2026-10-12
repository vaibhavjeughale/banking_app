export type AccountType = 'CHECKING' | 'SAVINGS' | 'INVESTMENT';
export type AccountStatus = 'ACTIVE' | 'FROZEN' | 'DORMANT';

export interface Account {
  id: string;
  ownerId: string;
  accountNumber: string;
  maskedAccountNumber: string;
  accountType: AccountType;
  currency: string;
  ledgerBalanceCents: number; // Stored in minor integer units
  availableBalanceCents: number; // Spendable liquid funds
  status: AccountStatus;
  nickname?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AccountSummary {
  account: Account;
  metrics: {
    ledgerBalance: string;
    availableBalance: string;
    holdAmount: string;
    totalTransactions: number;
    pendingCount: number;
  };
}
