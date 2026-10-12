import { Router, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth.middleware';
import { TransactionCategory } from '../types';

export const transactionRouter = Router();
transactionRouter.use(authMiddleware);

// GET /api/v1/transactions
transactionRouter.get('/', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let transactions = db.getTransactionsByOwnerId(user.id);

  const { search, type, status, category, startDate, endDate, limit = '50', page = '1' } = req.query;

  // Filter by search query (reference or description or beneficiary)
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    transactions = transactions.filter(
      (t) =>
        t.transactionReference.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        (t.beneficiaryName && t.beneficiaryName.toLowerCase().includes(q))
    );
  }

  // Filter by type
  if (type && typeof type === 'string') {
    transactions = transactions.filter((t) => t.type === type);
  }

  // Filter by status
  if (status && typeof status === 'string') {
    transactions = transactions.filter((t) => t.status === status);
  }

  // Filter by category
  if (category && typeof category === 'string') {
    transactions = transactions.filter((t) => t.category === category);
  }

  // Filter by date range
  if (startDate && typeof startDate === 'string') {
    const start = new Date(startDate).getTime();
    transactions = transactions.filter((t) => new Date(t.createdAt).getTime() >= start);
  }

  if (endDate && typeof endDate === 'string') {
    const end = new Date(endDate).getTime();
    transactions = transactions.filter((t) => new Date(t.createdAt).getTime() <= end);
  }

  const pageNum = Math.max(parseInt(page as string, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit as string, 10) || 50, 1), 100);
  const total = transactions.length;
  const paginated = transactions.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  return res.json({
    transactions: paginated,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    }
  });
});

// GET /api/v1/transactions/export/csv
transactionRouter.get('/export/csv', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const transactions = db.getTransactionsByOwnerId(user.id);

  let csv = 'Transaction Reference,Date,Description,Category,Type,Amount (USD),Status,Beneficiary\n';
  for (const t of transactions) {
    const amount = (t.amountCents / 100).toFixed(2);
    const sign = t.type === 'DEPOSIT' || t.type === 'INTEREST' ? '' : '-';
    csv += `"${t.transactionReference}","${new Date(t.createdAt).toISOString().slice(0, 10)}","${t.description.replace(/"/g, '""')}","${t.category}","${t.type}","${sign}${amount}","${t.status}","${t.beneficiaryName || ''}"\n`;
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="nexabank_statement_${user.id}_${Date.now()}.csv"`);
  return res.status(200).send(csv);
});

// GET /api/v1/transactions/:transactionId
transactionRouter.get('/:transactionId', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { transactionId } = req.params;
  const transaction = db.getTransactionById(transactionId) || db.getTransactionByReference(transactionId);

  if (!transaction) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  if (transaction.ownerId !== user.id && !user.roles.includes('ADMIN') && !user.roles.includes('COMPLIANCE_OFFICER')) {
    return res.status(403).json({ error: 'Unauthorized to view this transaction' });
  }

  return res.json({ transaction });
});

// GET /api/v1/transactions/:transactionId/receipt
transactionRouter.get('/:transactionId/receipt', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { transactionId } = req.params;
  const txn = db.getTransactionById(transactionId) || db.getTransactionByReference(transactionId);

  if (!txn) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  if (txn.ownerId !== user.id && !user.roles.includes('ADMIN')) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const sourceAcc = txn.sourceAccountId ? db.getAccountById(txn.sourceAccountId) : undefined;

  const receipt = {
    institution: 'NexaBank AI Global Clearing',
    transactionReference: txn.transactionReference,
    timestamp: txn.createdAt,
    status: txn.status,
    amount: `$${(txn.amountCents / 100).toFixed(2)}`,
    currency: txn.currency,
    type: txn.type,
    category: txn.category,
    sourceAccount: sourceAcc ? `${sourceAcc.nickname || sourceAcc.accountType} (${sourceAcc.maskedAccountNumber})` : 'Electronic Deposit',
    recipient: txn.beneficiaryName || 'Self / Authorized Recipient',
    description: txn.description,
    fee: '$0.00',
    verificationCode: `NB-SEC-${txn.transactionReference.slice(-6)}-${new Date(txn.createdAt).getTime().toString(36).toUpperCase()}`,
    clearingNetwork: 'FedNow / NexaInstant High-Velocity Rail'
  };

  return res.json({ receipt });
});

// POST /api/v1/transfers
transactionRouter.post('/', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const {
    sourceAccountId,
    destinationAccountId,
    beneficiaryId,
    customBeneficiary,
    amountCents,
    description,
    category,
    idempotencyKey
  } = req.body;

  if (!sourceAccountId) {
    return res.status(400).json({ error: 'Source account ID is required' });
  }

  if (!amountCents || typeof amountCents !== 'number' || amountCents <= 0) {
    return res.status(400).json({ error: 'Valid positive transfer amount in cents is required' });
  }

  const result = db.executeTransfer({
    sourceAccountId,
    destinationAccountId,
    beneficiaryId,
    customBeneficiary,
    amountCents,
    description: description || 'Wire Transfer',
    category: category as TransactionCategory,
    ownerId: user.id,
    idempotencyKey: idempotencyKey || (req.headers['x-idempotency-key'] as string),
    actorEmail: user.email
  });

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  return res.status(201).json({
    success: true,
    message: 'Transfer executed successfully and ledger balances committed.',
    transaction: result.transaction
  });
});
