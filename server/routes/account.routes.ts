import { Router, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth.middleware';

export const accountRouter = Router();

// All account routes require authentication
accountRouter.use(authMiddleware);

// GET /api/v1/accounts
accountRouter.get('/', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const accounts = db.getAccountsByOwnerId(user.id);
  return res.json({ accounts });
});

// GET /api/v1/accounts/:accountId
accountRouter.get('/:accountId', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { accountId } = req.params;
  const account = db.getAccountById(accountId);

  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  // Enforce account ownership (or Admin/Compliance role)
  const isPrivileged = user.roles.includes('ADMIN') || user.roles.includes('COMPLIANCE_OFFICER');
  if (account.ownerId !== user.id && !isPrivileged) {
    return res.status(403).json({ error: 'Access denied: You do not own this account' });
  }

  return res.json({ account });
});

// GET /api/v1/accounts/:accountId/summary
accountRouter.get('/:accountId/summary', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { accountId } = req.params;
  const account = db.getAccountById(accountId);

  if (!account || (account.ownerId !== user.id && !user.roles.includes('ADMIN'))) {
    return res.status(404).json({ error: 'Account not found' });
  }

  const txns = db.getTransactionsByOwnerId(user.id).filter(
    (t) => t.sourceAccountId === accountId || t.destinationAccountId === accountId
  );

  const pendingCount = txns.filter((t) => t.status === 'PENDING').length;
  const holdAmountCents = account.ledgerBalanceCents - account.availableBalanceCents;

  return res.json({
    account,
    metrics: {
      ledgerBalance: `$${(account.ledgerBalanceCents / 100).toFixed(2)}`,
      availableBalance: `$${(account.availableBalanceCents / 100).toFixed(2)}`,
      holdAmount: `$${(holdAmountCents / 100).toFixed(2)}`,
      totalTransactions: txns.length,
      pendingCount
    }
  });
});

// PATCH /api/v1/accounts/:accountId/nickname
accountRouter.patch('/:accountId/nickname', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { accountId } = req.params;
  const { nickname } = req.body;

  const account = db.getAccountById(accountId);
  if (!account || account.ownerId !== user.id) {
    return res.status(404).json({ error: 'Account not found' });
  }

  account.nickname = String(nickname || '').slice(0, 50);
  account.updatedAt = new Date().toISOString();

  return res.json({ success: true, account });
});
