import { BankingDatabase } from '../server/db';
import { AIService } from '../server/services/ai.service';
import crypto from 'crypto';

console.log('🧪 Starting NexaBank AI Core Verification Suite...');

async function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // Test Suite 1: Database Initialization & Seeding
  console.log('\n--- Test Suite 1: Database Initialization & Seeding ---');
  const db = new BankingDatabase();

  const alex = db.getUserById('usr_alex_morgan');
  assert(alex !== undefined, 'Customer Alex Morgan seeded successfully');
  assert(alex?.roles.includes('CUSTOMER') === true, 'Alex Morgan has CUSTOMER role');

  const admin = db.getUserById('usr_marcus_vance');
  assert(admin !== undefined && admin.roles.includes('ADMIN'), 'Admin Marcus Vance seeded with ADMIN role');

  const accounts = db.getAccountsByOwnerId('usr_alex_morgan');
  assert(accounts.length >= 2, 'Customer has at least 2 accounts (Checking & Savings)');

  const checking = accounts.find((a) => a.accountType === 'CHECKING')!;
  const initialAvailable = checking.availableBalanceCents;
  assert(initialAvailable > 0, `Checking account has positive balance ($${initialAvailable / 100})`);

  // Test Suite 2: Atomic Transfers & Balance Protections
  console.log('\n--- Test Suite 2: Atomic Transfers & Balance Protections ---');
  const transferAmount = 15000; // $150.00
  const idempotencyKey = 'test_idemp_key_1';

  // 1. Valid Transfer Execution
  const validRes = db.executeTransfer({
    sourceAccountId: checking.id,
    amountCents: transferAmount,
    description: 'Test Wire to Landlord',
    beneficiaryId: 'ben_1',
    ownerId: alex!.id,
    idempotencyKey,
    actorEmail: alex!.email
  });

  assert(validRes.success === true, 'Valid transfer executed successfully');
  assert(validRes.transaction !== undefined, 'Transaction record generated');
  assert(validRes.transaction?.status === 'COMPLETED', 'Transaction status is COMPLETED');

  // Verify atomic ledger balance deduction
  const updatedChecking = db.getAccountById(checking.id)!;
  assert(
    updatedChecking.availableBalanceCents === initialAvailable - transferAmount,
    'Available balance precisely deducted in integer cents'
  );

  // 2. Idempotency Check (Duplicate request with same idempotency key)
  const duplicateRes = db.executeTransfer({
    sourceAccountId: checking.id,
    amountCents: transferAmount,
    description: 'Duplicate retry',
    beneficiaryId: 'ben_1',
    ownerId: alex!.id,
    idempotencyKey,
    actorEmail: alex!.email
  });
  assert(duplicateRes.success === true, 'Idempotent transfer returns success without duplicate debit');
  assert(
    db.getAccountById(checking.id)!.availableBalanceCents === updatedChecking.availableBalanceCents,
    'Balance was not debited a second time for duplicate idempotency key'
  );

  // 3. Insufficient Funds Guard (Prevent negative balance)
  const excessiveAmount = checking.availableBalanceCents + 100000; // $1,000 more than available
  const failRes = db.executeTransfer({
    sourceAccountId: checking.id,
    amountCents: excessiveAmount,
    description: 'Overdraft Attempt',
    beneficiaryId: 'ben_1',
    ownerId: alex!.id,
    actorEmail: alex!.email
  });
  assert(failRes.success === false, 'Transfer rejected when exceeding available balance');
  assert(
    failRes.error?.includes('Insufficient available funds') === true,
    'Appropriate insufficient funds error returned'
  );

  // 4. Unauthorized Account Access (Cross-Customer isolation)
  const unauthorizedRes = db.executeTransfer({
    sourceAccountId: checking.id,
    amountCents: 1000,
    description: 'Hacker transfer',
    beneficiaryId: 'ben_1',
    ownerId: 'usr_different_customer',
    actorEmail: 'hacker@example.com'
  });
  assert(unauthorizedRes.success === false, 'Transfer rejected when source account does not belong to user');

  // 5. Beneficiary Cooldown Guard
  const cooldownRes = db.executeTransfer({
    sourceAccountId: checking.id,
    amountCents: 1000,
    description: 'Cooldown test transfer',
    beneficiaryId: 'ben_4', // Liam Reynolds has cooldown active
    ownerId: alex!.id,
    actorEmail: alex!.email
  });
  assert(cooldownRes.success === false, 'Transfer rejected for beneficiary in cooling-off period');

  // Test Suite 3: GenAI Banking Assistant Read-Only Tools
  console.log('\n--- Test Suite 3: GenAI Banking Assistant Read-Only Tools ---');
  const ai = new AIService(db);

  // Test Tool: getAccountSummary
  const summary = ai.getAccountSummary(alex!);
  assert(summary.accounts.length >= 2, 'AI getAccountSummary retrieved accounts list');
  assert(summary.accounts[0].maskedNumber.startsWith('••••'), 'Account numbers are strictly masked in AI output');

  // Test Tool: getRecentTransactions
  const recent = ai.getRecentTransactions(alex!, 5);
  assert(recent.length > 0 && recent.length <= 5, 'AI getRecentTransactions retrieved bounded transactions');

  // Test Tool: explainTransactionStatus
  const statusLookup = ai.explainTransactionStatus(alex!, validRes.transaction!.transactionReference);
  assert(statusLookup.found === true, 'AI lookup found recent transaction reference');
  assert(statusLookup.status === 'COMPLETED', 'AI correctly reported COMPLETED status');

  // Test Cross-customer AI Isolation
  const fakeUser = {
    id: 'usr_stranger',
    name: 'Stranger',
    email: 'stranger@test.com',
    passwordHash: 'abc',
    roles: ['CUSTOMER'] as any,
    status: 'ACTIVE' as any,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  const emptySummary = ai.getAccountSummary(fakeUser);
  assert(emptySummary.accounts.length === 0, 'AI queries strictly isolate customer data (zero leakage to foreign users)');

  // Test Suite 4: Audit Trail Integrity
  console.log('\n--- Test Suite 4: Audit Trail Integrity ---');
  const logs = db.getAuditLogs();
  assert(logs.length > 0, 'Audit logs were populated with system events');
  const transferLog = logs.find((l) => l.action === 'TRANSFER_EXECUTED');
  assert(transferLog !== undefined, 'TRANSFER_EXECUTED audit log persisted');
  assert(transferLog?.actorRole === 'CUSTOMER', 'Audit log correctly captures actor role');

  console.log(`\n========================================`);
  console.log(`Test Results: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
