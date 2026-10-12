import { EventEmitter } from 'events';
import crypto from 'crypto';
import {
  User,
  Account,
  Transaction,
  Beneficiary,
  Notification,
  AuditLog,
  AIConversation,
  AIConversationMessage,
  UserRole
} from './types';

// Global Event Emitter for SSE real-time distribution
export const bankEventEmitter = new EventEmitter();
bankEventEmitter.setMaxListeners(100);

export class BankingDatabase {
  private users: Map<string, User> = new Map();
  private accounts: Map<string, Account> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private beneficiaries: Map<string, Beneficiary> = new Map();
  private notifications: Map<string, Notification> = new Map();
  private auditLogs: AuditLog[] = [];
  private aiConversations: Map<string, AIConversation> = new Map();
  private idempotencyKeys: Map<string, { transactionId: string; response: unknown; timestamp: number }> = new Map();

  constructor() {
    this.seedInitialData();
  }

  // --- Seed Data ---
  private seedInitialData() {
    const now = new Date();
    const isoNow = now.toISOString();

    // 1. Seed Users (passwords hashed or verified via demo comparison)
    const demoPasswordHash = crypto.createHash('sha256').update('NexaBank#2026!').digest('hex');

    const customerUser: User = {
      id: 'usr_alex_morgan',
      name: 'Alex Morgan',
      email: 'alex.morgan@nexabank.demo',
      passwordHash: demoPasswordHash,
      roles: ['CUSTOMER'],
      status: 'ACTIVE',
      phone: '+1 (555) 234-5678',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
      createdAt: new Date(Date.now() - 180 * 86400000).toISOString(),
      updatedAt: isoNow
    };

    const agentUser: User = {
      id: 'usr_sarah_jenkins',
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@nexabank.demo',
      passwordHash: demoPasswordHash,
      roles: ['SUPPORT_AGENT'],
      status: 'ACTIVE',
      phone: '+1 (555) 345-6789',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256',
      createdAt: new Date(Date.now() - 240 * 86400000).toISOString(),
      updatedAt: isoNow
    };

    const complianceUser: User = {
      id: 'usr_elena_rostova',
      name: 'Elena Rostova',
      email: 'elena.rostova@nexabank.demo',
      passwordHash: demoPasswordHash,
      roles: ['COMPLIANCE_OFFICER'],
      status: 'ACTIVE',
      phone: '+1 (555) 456-7890',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256',
      createdAt: new Date(Date.now() - 300 * 86400000).toISOString(),
      updatedAt: isoNow
    };

    const adminUser: User = {
      id: 'usr_marcus_vance',
      name: 'Marcus Vance',
      email: 'marcus.vance@nexabank.demo',
      passwordHash: demoPasswordHash,
      roles: ['ADMIN'],
      status: 'ACTIVE',
      phone: '+1 (555) 789-0123',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
      createdAt: new Date(Date.now() - 365 * 86400000).toISOString(),
      updatedAt: isoNow
    };

    this.users.set(customerUser.id, customerUser);
    this.users.set(agentUser.id, agentUser);
    this.users.set(complianceUser.id, complianceUser);
    this.users.set(adminUser.id, adminUser);

    // 2. Seed Accounts for Alex Morgan
    const checkingAcc: Account = {
      id: 'acc_chk_4821',
      ownerId: customerUser.id,
      accountNumber: '104820984821',
      maskedAccountNumber: '•••• 4821',
      accountType: 'CHECKING',
      currency: 'USD',
      ledgerBalanceCents: 1485050, // $14,850.50
      availableBalanceCents: 1465050, // $14,650.50 ($200 pending hold)
      status: 'ACTIVE',
      nickname: 'Primary Everyday Checking',
      createdAt: new Date(Date.now() - 150 * 86400000).toISOString(),
      updatedAt: isoNow
    };

    const savingsAcc: Account = {
      id: 'acc_sav_9934',
      ownerId: customerUser.id,
      accountNumber: '104820989934',
      maskedAccountNumber: '•••• 9934',
      accountType: 'SAVINGS',
      currency: 'USD',
      ledgerBalanceCents: 4250000, // $42,500.00
      availableBalanceCents: 4250000, // $42,500.00
      status: 'ACTIVE',
      nickname: 'High-Yield Wealth Reserve (4.75% APY)',
      createdAt: new Date(Date.now() - 120 * 86400000).toISOString(),
      updatedAt: isoNow
    };

    this.accounts.set(checkingAcc.id, checkingAcc);
    this.accounts.set(savingsAcc.id, savingsAcc);

    // 3. Seed Beneficiaries for Alex
    const beneficiariesList: Beneficiary[] = [
      {
        id: 'ben_1',
        ownerId: customerUser.id,
        displayName: 'TechCorp Apex Landlord LLC',
        accountNumber: '9847291048',
        maskedAccountNumber: '•••• 1048',
        bankName: 'JPMorgan Chase Bank, N.A.',
        routingCode: '021000021',
        currency: 'USD',
        verified: true,
        createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
        updatedAt: isoNow
      },
      {
        id: 'ben_2',
        ownerId: customerUser.id,
        displayName: 'Sophia Sterling (Sister)',
        accountNumber: '7729104819',
        maskedAccountNumber: '•••• 4819',
        bankName: 'Bank of America',
        routingCode: '121000358',
        currency: 'USD',
        verified: true,
        createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
        updatedAt: isoNow
      },
      {
        id: 'ben_3',
        ownerId: customerUser.id,
        displayName: 'Nordic Clean Energy Grid',
        accountNumber: '4491028471',
        maskedAccountNumber: '•••• 8471',
        bankName: 'Wells Fargo Bank, N.A.',
        routingCode: '121000248',
        currency: 'USD',
        verified: true,
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        updatedAt: isoNow
      },
      {
        id: 'ben_4',
        ownerId: customerUser.id,
        displayName: 'Liam Reynolds (Contractor)',
        accountNumber: '5581940192',
        maskedAccountNumber: '•••• 0192',
        bankName: 'Citibank N.A.',
        routingCode: '021000089',
        currency: 'USD',
        verified: false,
        coolingOffUntil: new Date(Date.now() + 48 * 3600000).toISOString(), // Cooldown active for demo
        createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
        updatedAt: isoNow
      }
    ];

    for (const b of beneficiariesList) {
      this.beneficiaries.set(b.id, b);
    }

    // 4. Seed Rich Realistic Transactions (Spread over current & prior month)
    const seedTxns: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        transactionReference: 'TXN-NEXA-20261010-0912',
        sourceAccountId: checkingAcc.id,
        ownerId: customerUser.id,
        type: 'TRANSFER',
        amountCents: 245000, // $2,450.00
        feeCents: 0,
        currency: 'USD',
        status: 'COMPLETED',
        category: 'Utilities & Bills',
        description: 'Monthly Apartment Lease Wire Transfer - Unit 14B',
        beneficiaryName: 'TechCorp Apex Landlord LLC'
      },
      {
        transactionReference: 'TXN-NEXA-20261008-1420',
        destinationAccountId: checkingAcc.id,
        ownerId: customerUser.id,
        type: 'DEPOSIT',
        amountCents: 685000, // $6,850.00
        feeCents: 0,
        currency: 'USD',
        status: 'COMPLETED',
        category: 'Income & Salary',
        description: 'Bi-Weekly Direct Deposit Payroll - Quantum Dynamics Corp'
      },
      {
        transactionReference: 'TXN-NEXA-20261007-1833',
        sourceAccountId: checkingAcc.id,
        ownerId: customerUser.id,
        type: 'BILL_PAY',
        amountCents: 14280, // $142.80
        feeCents: 0,
        currency: 'USD',
        status: 'COMPLETED',
        category: 'Groceries',
        description: 'Whole Foods Market - Organic Groceries & Produce'
      },
      {
        transactionReference: 'TXN-NEXA-20261005-2015',
        sourceAccountId: checkingAcc.id,
        ownerId: customerUser.id,
        type: 'BILL_PAY',
        amountCents: 8950, // $89.50
        feeCents: 0,
        currency: 'USD',
        status: 'COMPLETED',
        category: 'Dining & Restaurants',
        description: 'L’Osteria Artisanal Trattoria - Dinner & Beverage'
      },
      {
        transactionReference: 'TXN-NEXA-20261003-1100',
        sourceAccountId: checkingAcc.id,
        ownerId: customerUser.id,
        type: 'BILL_PAY',
        amountCents: 2499, // $24.99
        feeCents: 0,
        currency: 'USD',
        status: 'COMPLETED',
        category: 'Subscriptions',
        description: 'AI Cloud Platform Pro Developer Tier'
      },
      {
        transactionReference: 'TXN-NEXA-20261001-0900',
        destinationAccountId: savingsAcc.id,
        ownerId: customerUser.id,
        type: 'INTEREST',
        amountCents: 16820, // $168.20
        feeCents: 0,
        currency: 'USD',
        status: 'COMPLETED',
        category: 'Income & Salary',
        description: 'Monthly High-Yield Savings Accrued Interest Payout'
      },
      {
        transactionReference: 'TXN-NEXA-20260928-1540',
        sourceAccountId: checkingAcc.id,
        ownerId: customerUser.id,
        type: 'BILL_PAY',
        amountCents: 18450, // $184.50
        feeCents: 0,
        currency: 'USD',
        status: 'COMPLETED',
        category: 'Utilities & Bills',
        description: 'Nordic Clean Energy Grid - Electric & Heating Utility'
      },
      {
        transactionReference: 'TXN-NEXA-20260925-1210',
        destinationAccountId: checkingAcc.id,
        ownerId: customerUser.id,
        type: 'DEPOSIT',
        amountCents: 685000, // $6,850.00
        feeCents: 0,
        currency: 'USD',
        status: 'COMPLETED',
        category: 'Income & Salary',
        description: 'Bi-Weekly Direct Deposit Payroll - Quantum Dynamics Corp'
      },
      {
        transactionReference: 'TXN-NEXA-20260922-1920',
        sourceAccountId: checkingAcc.id,
        ownerId: customerUser.id,
        type: 'TRANSFER',
        amountCents: 35000, // $350.00
        feeCents: 0,
        currency: 'USD',
        status: 'COMPLETED',
        category: 'Transfers',
        description: 'Peer-to-Peer Transfer: Family Birthday Gift',
        beneficiaryName: 'Sophia Sterling (Sister)'
      },
      {
        transactionReference: 'TXN-NEXA-20260918-1411',
        sourceAccountId: checkingAcc.id,
        ownerId: customerUser.id,
        type: 'BILL_PAY',
        amountCents: 21500, // $215.00
        feeCents: 0,
        currency: 'USD',
        status: 'COMPLETED',
        category: 'Shopping & Retail',
        description: 'Patagonia Outdoor Equipment & Apparel'
      },
      {
        transactionReference: 'TXN-NEXA-20260915-0830',
        sourceAccountId: checkingAcc.id,
        ownerId: customerUser.id,
        type: 'BILL_PAY',
        amountCents: 4200, // $42.00
        feeCents: 0,
        currency: 'USD',
        status: 'COMPLETED',
        category: 'Travel & Transit',
        description: 'Metropolitan Transit Express Commuter Pass'
      },
      {
        transactionReference: 'TXN-NEXA-20260912-1645',
        sourceAccountId: checkingAcc.id,
        ownerId: customerUser.id,
        type: 'TRANSFER',
        amountCents: 550000, // $5,500.00
        feeCents: 0,
        currency: 'USD',
        status: 'FAILED',
        category: 'Transfers',
        description: 'International Wire Transfer - High Limit Test',
        beneficiaryName: 'Offshore Trading LLC',
        failureReason: 'Daily velocity limit exceeded (Sandbox compliance rule flag)'
      }
    ];

    let dayOffset = 1;
    for (const t of seedTxns) {
      const txnId = `txn_${t.transactionReference.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      const txnTime = new Date(Date.now() - dayOffset * 86400000 * 2.5).toISOString();
      const transaction: Transaction = {
        ...t,
        id: txnId,
        createdAt: txnTime,
        updatedAt: txnTime
      };
      this.transactions.set(transaction.id, transaction);
      dayOffset++;
    }

    // 5. Seed Notifications
    const seedNotifs: Omit<Notification, 'id' | 'createdAt'>[] = [
      {
        userId: customerUser.id,
        type: 'SECURITY_ALERT',
        title: 'New Device Sign-in Verified',
        message: 'A secure sign-in occurred from Chrome on macOS Sonoma (San Francisco, CA).'
      },
      {
        userId: customerUser.id,
        type: 'TRANSFER_SUCCESS',
        title: 'Direct Deposit Credited',
        message: 'Your payroll deposit of $6,850.00 from Quantum Dynamics Corp is now available in Checking (•••• 4821).'
      },
      {
        userId: customerUser.id,
        type: 'SYSTEM',
        title: 'NexaBank AI Assistant Active',
        message: 'Your personal financial AI assistant is ready to analyze spending trends and answer banking inquiries.'
      }
    ];

    seedNotifs.forEach((n, idx) => {
      const nId = `notif_${idx + 1}`;
      this.notifications.set(nId, {
        ...n,
        id: nId,
        readAt: idx > 1 ? isoNow : null,
        createdAt: new Date(Date.now() - idx * 12 * 3600000).toISOString()
      });
    });

    // 6. Seed Audit Log entries
    this.recordAuditLog({
      actorId: adminUser.id,
      actorRole: 'ADMIN',
      actorEmail: adminUser.email,
      action: 'SYSTEM_BOOTSTRAP',
      resourceType: 'SYSTEM',
      requestId: 'req_init_sys',
      ipAddress: '127.0.0.1',
      status: 'SUCCESS',
      details: { environment: 'production-simulation', version: '2.4.0' }
    });

    this.recordAuditLog({
      actorId: customerUser.id,
      actorRole: 'CUSTOMER',
      actorEmail: customerUser.email,
      action: 'USER_LOGIN_MFA_PASS',
      resourceType: 'AUTH',
      requestId: 'req_auth_seed',
      ipAddress: '198.51.100.42',
      status: 'SUCCESS',
      details: { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)' }
    });
  }

  // --- Users ---
  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  getUserByEmail(email: string): User | undefined {
    const target = email.toLowerCase().trim();
    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === target) return u;
    }
    return undefined;
  }

  createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
    const id = `usr_${crypto.randomBytes(6).toString('hex')}`;
    const now = new Date().toISOString();
    const newUser: User = {
      ...userData,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.users.set(newUser.id, newUser);

    // Automatically provision default Checking and Savings accounts for new customer
    if (newUser.roles.includes('CUSTOMER')) {
      const randomAccNum = Math.floor(100000000000 + Math.random() * 900000000000).toString();
      const checking: Account = {
        id: `acc_chk_${newUser.id.substring(4, 10)}`,
        ownerId: newUser.id,
        accountNumber: randomAccNum,
        maskedAccountNumber: `•••• ${randomAccNum.slice(-4)}`,
        accountType: 'CHECKING',
        currency: 'USD',
        ledgerBalanceCents: 500000, // $5,000 welcome demo balance
        availableBalanceCents: 500000,
        status: 'ACTIVE',
        nickname: 'Everyday Checking',
        createdAt: now,
        updatedAt: now
      };
      this.accounts.set(checking.id, checking);
    }

    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const existing = this.users.get(id);
    if (!existing) return undefined;
    const updated: User = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.users.set(id, updated);
    return updated;
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  // --- Accounts ---
  getAccountsByOwnerId(ownerId: string): Account[] {
    return Array.from(this.accounts.values()).filter((a) => a.ownerId === ownerId);
  }

  getAccountById(id: string): Account | undefined {
    return this.accounts.get(id);
  }

  updateAccountStatus(id: string, status: Account['status']): Account | undefined {
    const acc = this.accounts.get(id);
    if (!acc) return undefined;
    acc.status = status;
    acc.updatedAt = new Date().toISOString();
    this.accounts.set(id, acc);
    return acc;
  }

  // --- Transactions ---
  getTransactionsByOwnerId(ownerId: string): Transaction[] {
    return Array.from(this.transactions.values())
      .filter((t) => t.ownerId === ownerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getTransactionById(id: string): Transaction | undefined {
    return this.transactions.get(id);
  }

  getTransactionByReference(ref: string): Transaction | undefined {
    for (const t of this.transactions.values()) {
      if (t.transactionReference.toUpperCase() === ref.toUpperCase()) return t;
    }
    return undefined;
  }

  getAllTransactions(): Transaction[] {
    return Array.from(this.transactions.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // --- Atomic Transfer Execution ---
  executeTransfer(params: {
    sourceAccountId: string;
    destinationAccountId?: string;
    beneficiaryId?: string;
    customBeneficiary?: { displayName: string; accountNumber: string; bankName: string };
    amountCents: number;
    description: string;
    category?: Transaction['category'];
    ownerId: string;
    idempotencyKey?: string;
    actorEmail: string;
  }): { success: boolean; transaction?: Transaction; error?: string } {
    const {
      sourceAccountId,
      destinationAccountId,
      beneficiaryId,
      customBeneficiary,
      amountCents,
      description,
      category = 'Transfers',
      ownerId,
      idempotencyKey,
      actorEmail
    } = params;

    // 1. Idempotency Check
    if (idempotencyKey && this.idempotencyKeys.has(idempotencyKey)) {
      const cached = this.idempotencyKeys.get(idempotencyKey)!;
      const existingTxn = this.transactions.get(cached.transactionId);
      if (existingTxn) {
        return { success: true, transaction: existingTxn };
      }
    }

    // 2. Validate Amount
    if (amountCents <= 0 || !Number.isInteger(amountCents)) {
      return { success: false, error: 'Transfer amount must be a positive integer in minor units (cents).' };
    }

    if (amountCents > 50000000) { // $500,000 threshold
      return { success: false, error: 'Transfer amount exceeds maximum per-transaction limit ($500,000.00).' };
    }

    // 3. Source Account Validation & Ownership
    const sourceAcc = this.accounts.get(sourceAccountId);
    if (!sourceAcc) {
      return { success: false, error: 'Source account not found.' };
    }
    if (sourceAcc.ownerId !== ownerId) {
      return { success: false, error: 'Unauthorized: Source account does not belong to the authenticated user.' };
    }
    if (sourceAcc.status !== 'ACTIVE') {
      return { success: false, error: `Source account is currently ${sourceAcc.status}. Transfers are disabled.` };
    }

    // 4. Balance Verification (Prevent negative balances)
    if (sourceAcc.availableBalanceCents < amountCents) {
      return {
        success: false,
        error: `Insufficient available funds. Available: $${(sourceAcc.availableBalanceCents / 100).toFixed(2)}, Requested: $${(amountCents / 100).toFixed(2)}`
      };
    }

    // 5. Destination Validation
    let destAcc: Account | undefined;
    let targetName = 'Beneficiary Transfer';
    let targetMaskedAcc = '•••• ----';

    if (destinationAccountId) {
      destAcc = this.accounts.get(destinationAccountId);
      if (!destAcc) {
        return { success: false, error: 'Destination account not found.' };
      }
      if (destAcc.status !== 'ACTIVE') {
        return { success: false, error: 'Destination account is not active.' };
      }
      targetName = destAcc.nickname || `Account ${destAcc.maskedAccountNumber}`;
      targetMaskedAcc = destAcc.maskedAccountNumber;
    } else if (beneficiaryId) {
      const ben = this.beneficiaries.get(beneficiaryId);
      if (!ben || ben.ownerId !== ownerId) {
        return { success: false, error: 'Selected beneficiary was not found or is unauthorized.' };
      }
      if (ben.coolingOffUntil && new Date(ben.coolingOffUntil).getTime() > Date.now()) {
        const remainingHours = Math.ceil((new Date(ben.coolingOffUntil).getTime() - Date.now()) / 3600000);
        return {
          success: false,
          error: `Beneficiary is in mandatory security cooldown period (${remainingHours} hours remaining).`
        };
      }
      targetName = ben.displayName;
      targetMaskedAcc = ben.maskedAccountNumber;
    } else if (customBeneficiary) {
      targetName = customBeneficiary.displayName.trim();
      targetMaskedAcc = `•••• ${customBeneficiary.accountNumber.slice(-4)}`;
    } else {
      return { success: false, error: 'Please specify an eligible destination account or beneficiary.' };
    }

    // 6. Atomic Ledger Execution
    const nowIso = new Date().toISOString();
    const refCode = `TXN-NEXA-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const txnId = `txn_${crypto.randomBytes(8).toString('hex')}`;

    // Deduct source
    sourceAcc.availableBalanceCents -= amountCents;
    sourceAcc.ledgerBalanceCents -= amountCents;
    sourceAcc.updatedAt = nowIso;
    this.accounts.set(sourceAcc.id, sourceAcc);

    // If internal transfer between user accounts or another bank account in system
    if (destAcc) {
      destAcc.availableBalanceCents += amountCents;
      destAcc.ledgerBalanceCents += amountCents;
      destAcc.updatedAt = nowIso;
      this.accounts.set(destAcc.id, destAcc);
    }

    // Create Transaction Record
    const transactionRecord: Transaction = {
      id: txnId,
      transactionReference: refCode,
      sourceAccountId: sourceAcc.id,
      destinationAccountId: destAcc ? destAcc.id : undefined,
      beneficiaryName: targetName,
      ownerId,
      type: 'TRANSFER',
      amountCents,
      feeCents: 0,
      currency: sourceAcc.currency,
      status: 'COMPLETED',
      category: category,
      description: description.trim() || `Wire transfer to ${targetName}`,
      idempotencyKey,
      createdAt: nowIso,
      updatedAt: nowIso
    };
    this.transactions.set(txnId, transactionRecord);

    // Cache idempotency
    if (idempotencyKey) {
      this.idempotencyKeys.set(idempotencyKey, {
        transactionId: txnId,
        response: transactionRecord,
        timestamp: Date.now()
      });
    }

    // Create In-App Notification
    const notifId = `notif_${crypto.randomBytes(6).toString('hex')}`;
    const notification: Notification = {
      id: notifId,
      userId: ownerId,
      type: 'TRANSFER_SUCCESS',
      title: 'Transfer Completed Successfully',
      message: `$${(amountCents / 100).toFixed(2)} sent to ${targetName} (${targetMaskedAcc}). Ref: ${refCode}.`,
      readAt: null,
      createdAt: nowIso,
      metadata: { transactionReference: refCode, amountCents }
    };
    this.notifications.set(notifId, notification);

    // Record Audit Log
    this.recordAuditLog({
      actorId: ownerId,
      actorRole: 'CUSTOMER',
      actorEmail,
      action: 'TRANSFER_EXECUTED',
      resourceType: 'TRANSACTION',
      resourceId: txnId,
      requestId: idempotencyKey || `req_${Date.now()}`,
      ipAddress: '127.0.0.1',
      status: 'SUCCESS',
      details: {
        amountCents,
        sourceAccountId,
        beneficiary: targetName,
        reference: refCode
      }
    });

    // 7. Emit Real-time SSE Event
    bankEventEmitter.emit('bank_event', {
      type: 'TRANSACTION_CREATED',
      userId: ownerId,
      data: {
        transaction: transactionRecord,
        notification,
        sourceAccount: sourceAcc,
        destinationAccount: destAcc
      }
    });

    return { success: true, transaction: transactionRecord };
  }

  // --- Beneficiaries ---
  getBeneficiariesByOwnerId(ownerId: string): Beneficiary[] {
    return Array.from(this.beneficiaries.values()).filter((b) => b.ownerId === ownerId);
  }

  getBeneficiaryById(id: string): Beneficiary | undefined {
    return this.beneficiaries.get(id);
  }

  addBeneficiary(beneficiary: Omit<Beneficiary, 'id' | 'createdAt' | 'updatedAt' | 'maskedAccountNumber'>): Beneficiary {
    const id = `ben_${crypto.randomBytes(6).toString('hex')}`;
    const now = new Date().toISOString();
    const masked = `•••• ${beneficiary.accountNumber.slice(-4)}`;
    const newBen: Beneficiary = {
      ...beneficiary,
      id,
      maskedAccountNumber: masked,
      createdAt: now,
      updatedAt: now
    };
    this.beneficiaries.set(id, newBen);

    // Audit log
    this.recordAuditLog({
      actorId: beneficiary.ownerId,
      actorRole: 'CUSTOMER',
      actorEmail: 'customer@nexabank.demo',
      action: 'BENEFICIARY_CREATED',
      resourceType: 'BENEFICIARY',
      resourceId: id,
      requestId: `req_${Date.now()}`,
      ipAddress: '127.0.0.1',
      status: 'SUCCESS',
      details: { name: beneficiary.displayName, bank: beneficiary.bankName }
    });

    return newBen;
  }

  deleteBeneficiary(id: string, ownerId: string): boolean {
    const ben = this.beneficiaries.get(id);
    if (!ben || ben.ownerId !== ownerId) return false;
    this.beneficiaries.delete(id);
    return true;
  }

  // --- Notifications ---
  getNotificationsByUserId(userId: string): Notification[] {
    return Array.from(this.notifications.values())
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  markNotificationAsRead(id: string, userId: string): boolean {
    const notif = this.notifications.get(id);
    if (!notif || notif.userId !== userId) return false;
    notif.readAt = new Date().toISOString();
    this.notifications.set(id, notif);
    return true;
  }

  markAllNotificationsRead(userId: string): void {
    const now = new Date().toISOString();
    for (const notif of this.notifications.values()) {
      if (notif.userId === userId && !notif.readAt) {
        notif.readAt = now;
      }
    }
  }

  // --- Audit Logs ---
  recordAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const newLog: AuditLog = {
      ...log,
      id: `audit_${crypto.randomBytes(8).toString('hex')}`,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(newLog); // latest first
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop(); // keep recent 500
    }
    return newLog;
  }

  getAuditLogs(filters?: { actorRole?: UserRole; resourceType?: string; status?: string }): AuditLog[] {
    return this.auditLogs.filter((log) => {
      if (filters?.actorRole && log.actorRole !== filters.actorRole) return false;
      if (filters?.resourceType && log.resourceType !== filters.resourceType) return false;
      if (filters?.status && log.status !== filters.status) return false;
      return true;
    });
  }

  // --- AI Conversations ---
  getAIConversation(userId: string, conversationId?: string): AIConversation {
    if (conversationId && this.aiConversations.has(conversationId)) {
      const conv = this.aiConversations.get(conversationId)!;
      if (conv.userId === userId) return conv;
    }

    // Find default or create new
    for (const conv of this.aiConversations.values()) {
      if (conv.userId === userId) return conv;
    }

    const newId = `conv_${crypto.randomBytes(6).toString('hex')}`;
    const now = new Date().toISOString();
    const newConv: AIConversation = {
      id: newId,
      userId,
      title: 'Financial Assistant Session',
      messages: [
        {
          id: 'msg_welcome',
          sender: 'assistant',
          content:
            "Hello Alex! I am **NexaBank AI**, your personal financial assistant. I can help analyze your spending, review transaction history, check balances, or summarize monthly cash flows. How can I assist your financial journey today?",
          timestamp: now
        }
      ],
      createdAt: now,
      updatedAt: now
    };
    this.aiConversations.set(newId, newConv);
    return newConv;
  }

  addAIMessage(conversationId: string, message: Omit<AIConversationMessage, 'id' | 'timestamp'>): AIConversationMessage {
    const conv = this.aiConversations.get(conversationId);
    if (!conv) throw new Error('Conversation not found');
    const fullMsg: AIConversationMessage = {
      ...message,
      id: `msg_${crypto.randomBytes(6).toString('hex')}`,
      timestamp: new Date().toISOString()
    };
    conv.messages.push(fullMsg);
    conv.updatedAt = new Date().toISOString();
    this.aiConversations.set(conversationId, conv);
    return fullMsg;
  }
}

export const db = new BankingDatabase();
