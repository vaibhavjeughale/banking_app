export type UserRole = 'CUSTOMER' | 'SUPPORT_AGENT' | 'COMPLIANCE_OFFICER' | 'ADMIN';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'FLAGGED';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  roles: UserRole[];
  status: UserStatus;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type AccountType = 'CHECKING' | 'SAVINGS' | 'INVESTMENT';
export type AccountStatus = 'ACTIVE' | 'FROZEN' | 'DORMANT';

export interface Account {
  id: string;
  ownerId: string;
  accountNumber: string; // Real or full simulated
  maskedAccountNumber: string; // e.g. "•••• 4821"
  accountType: AccountType;
  currency: string; // e.g. "USD"
  ledgerBalanceCents: number; // Stored in cents (integer minor units)
  availableBalanceCents: number; // Stored in cents
  status: AccountStatus;
  nickname?: string;
  createdAt: string;
  updatedAt: string;
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
  transactionReference: string; // e.g. "TXN-NEXA-20261011-8921"
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
  flaggedSuspicious?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Beneficiary {
  id: string;
  ownerId: string;
  displayName: string;
  accountNumber: string;
  maskedAccountNumber: string;
  bankName: string;
  routingCode: string; // e.g. ABA / IFSC / SWIFT
  currency: string;
  verified: boolean;
  coolingOffUntil?: string; // Cooldown for newly added payees
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'TRANSFER_SUCCESS' | 'TRANSFER_FAILED' | 'SECURITY_ALERT' | 'ACCOUNT_UPDATE' | 'SYSTEM';
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
  resourceType: 'ACCOUNT' | 'TRANSACTION' | 'BENEFICIARY' | 'USER' | 'AUTH' | 'SYSTEM';
  resourceId?: string;
  requestId: string;
  ipAddress: string;
  status: 'SUCCESS' | 'FAILURE' | 'WARNING';
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface AIConversationMessage {
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

export interface AIConversation {
  id: string;
  userId: string;
  title: string;
  messages: AIConversationMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  token: string;
  user: Omit<User, 'passwordHash'>;
  expiresAt: number;
}
