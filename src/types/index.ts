export type UserRole = 'CUSTOMER' | 'SUPPORT_AGENT' | 'COMPLIANCE_OFFICER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'FLAGGED';

export interface User {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  status: UserStatus;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Account {
  id: string;
  ownerId: string;
  accountNumber: string;
  maskedAccountNumber: string;
  accountType: 'CHECKING' | 'SAVINGS' | 'INVESTMENT';
  currency: string;
  ledgerBalanceCents: number;
  availableBalanceCents: number;
  status: 'ACTIVE' | 'FROZEN' | 'DORMANT';
  nickname?: string;
  createdAt: string;
}

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
  beneficiaryName?: string;
  ownerId: string;
  type: TransactionType;
  amountCents: number;
  feeCents: number;
  currency: string;
  status: TransactionStatus;
  category: TransactionCategory;
  description: string;
  failureReason?: string;
  createdAt: string;
}

export interface Beneficiary {
  id: string;
  ownerId: string;
  displayName: string;
  accountNumber: string;
  maskedAccountNumber: string;
  bankName: string;
  routingCode: string;
  currency: string;
  verified: boolean;
  coolingOffUntil?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  readAt?: string | null;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorRole: UserRole;
  actorEmail: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  requestId: string;
  ipAddress: string;
  status: 'SUCCESS' | 'FAILURE' | 'WARNING';
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  toolCalls?: {
    name: string;
    params: Record<string, unknown>;
    result?: unknown;
  }[];
}
