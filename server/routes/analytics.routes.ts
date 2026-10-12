import { Router, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth.middleware';

export const analyticsRouter = Router();
analyticsRouter.use(authMiddleware);

// GET /api/v1/analytics/spending
analyticsRouter.get('/spending', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const txns = db.getTransactionsByOwnerId(user.id);

  const categoryMap: Record<string, number> = {};
  let totalDebitCents = 0;

  for (const t of txns) {
    if (t.status === 'COMPLETED' && (t.type === 'BILL_PAY' || t.type === 'TRANSFER' || t.type === 'WITHDRAWAL')) {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amountCents;
      totalDebitCents += t.amountCents;
    }
  }

  const categoryBreakdown = Object.entries(categoryMap).map(([category, amountCents]) => ({
    category,
    amountCents,
    amountFormatted: `$${(amountCents / 100).toFixed(2)}`,
    percentage: totalDebitCents > 0 ? Math.round((amountCents / totalDebitCents) * 100) : 0
  })).sort((a, b) => b.amountCents - a.amountCents);

  return res.json({
    totalDebitCents,
    totalDebitFormatted: `$${(totalDebitCents / 100).toFixed(2)}`,
    categoryBreakdown
  });
});

// GET /api/v1/analytics/monthly-summary
analyticsRouter.get('/monthly-summary', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const txns = db.getTransactionsByOwnerId(user.id);

  // Group by month
  const monthlyData: Record<string, { month: string; incomeCents: number; expenseCents: number }> = {};

  for (const t of txns) {
    if (t.status !== 'COMPLETED') continue;
    const date = new Date(t.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    if (!monthlyData[key]) {
      monthlyData[key] = { month: monthName, incomeCents: 0, expenseCents: 0 };
    }

    if (t.type === 'DEPOSIT' || t.type === 'INTEREST') {
      monthlyData[key].incomeCents += t.amountCents;
    } else {
      monthlyData[key].expenseCents += t.amountCents;
    }
  }

  const history = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([_, v]) => ({
      month: v.month,
      income: v.incomeCents / 100,
      expenses: v.expenseCents / 100,
      netSavings: (v.incomeCents - v.expenseCents) / 100
    }));

  const accounts = db.getAccountsByOwnerId(user.id);
  const totalBalanceCents = accounts.reduce((acc, a) => acc + a.availableBalanceCents, 0);

  return res.json({
    history,
    totalBalanceFormatted: `$${(totalBalanceCents / 100).toFixed(2)}`
  });
});
