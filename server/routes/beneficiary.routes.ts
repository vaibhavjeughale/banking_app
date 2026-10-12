import { Router, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth.middleware';

export const beneficiaryRouter = Router();
beneficiaryRouter.use(authMiddleware);

// GET /api/v1/beneficiaries
beneficiaryRouter.get('/', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const beneficiaries = db.getBeneficiariesByOwnerId(user.id);
  return res.json({ beneficiaries });
});

// POST /api/v1/beneficiaries
beneficiaryRouter.post('/', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { displayName, accountNumber, bankName, routingCode, currency = 'USD' } = req.body;

  if (!displayName || !accountNumber || !bankName) {
    return res.status(400).json({ error: 'Display name, account number, and bank name are required' });
  }

  if (accountNumber.length < 4) {
    return res.status(400).json({ error: 'Account number must be at least 4 digits' });
  }

  // Cooldown security simulation for newly added beneficiaries
  const coolingOffUntil = new Date(Date.now() + 2 * 3600000).toISOString(); // 2 hours cooldown

  const newBeneficiary = db.addBeneficiary({
    ownerId: user.id,
    displayName: displayName.trim(),
    accountNumber: accountNumber.trim(),
    bankName: bankName.trim(),
    routingCode: (routingCode || '021000021').trim(),
    currency: currency.toUpperCase(),
    verified: true,
    coolingOffUntil
  });

  return res.status(201).json({
    success: true,
    message: 'Beneficiary registered. 2-hour security cooling-off window initialized.',
    beneficiary: newBeneficiary
  });
});

// DELETE /api/v1/beneficiaries/:beneficiaryId
beneficiaryRouter.delete('/:beneficiaryId', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { beneficiaryId } = req.params;

  const deleted = db.deleteBeneficiary(beneficiaryId, user.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Beneficiary not found or unauthorized' });
  }

  return res.json({ success: true, message: 'Beneficiary deactivated' });
});
