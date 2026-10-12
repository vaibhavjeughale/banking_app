import { Router, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest, authMiddleware, requireRole } from '../middleware/auth.middleware';

export const adminRouter = Router();

// Secure admin routes to operations roles
adminRouter.use(authMiddleware);
adminRouter.use(requireRole('ADMIN', 'COMPLIANCE_OFFICER', 'SUPPORT_AGENT'));

// GET /api/v1/admin/overview
adminRouter.get('/overview', (req: AuthenticatedRequest, res: Response) => {
  const users = db.getAllUsers();
  const transactions = db.getAllTransactions();
  const accounts = users.flatMap((u) => db.getAccountsByOwnerId(u.id));

  const totalDepositsCents = accounts.reduce((acc, a) => acc + a.ledgerBalanceCents, 0);
  const completedTxns = transactions.filter((t) => t.status === 'COMPLETED');
  const failedTxns = transactions.filter((t) => t.status === 'FAILED');
  const totalVolumeCents = completedTxns.reduce((acc, t) => acc + t.amountCents, 0);

  // Simulated Suspicious Activity Alerts
  const suspiciousAlerts = [
    {
      id: 'alt_1',
      severity: 'HIGH',
      type: 'VELOCITY_SPIKE',
      title: 'High Velocity Wire Transfer Attempt',
      description: 'Transfer of $5,500.00 flagged by fraud rule ENGINE_V4 (daily limit exceeded).',
      timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
      user: 'Alex Morgan (usr_alex_morgan)'
    },
    {
      id: 'alt_2',
      severity: 'MEDIUM',
      type: 'GEO_ANOMALY',
      title: 'Geographic Sign-in Anomaly',
      description: 'Session IP transition from US-West to US-East within 12 minutes.',
      timestamp: new Date(Date.now() - 14 * 3600000).toISOString(),
      user: 'Sarah Jenkins (usr_sarah_jenkins)'
    }
  ];

  return res.json({
    metrics: {
      totalCustomers: users.filter((u) => u.roles.includes('CUSTOMER')).length,
      totalDepositsFormatted: `$${(totalDepositsCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      totalVolumeFormatted: `$${(totalVolumeCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      completedTransactionsCount: completedTxns.length,
      failedTransactionsCount: failedTxns.length,
      activeAlertsCount: suspiciousAlerts.length
    },
    suspiciousAlerts
  });
});

// GET /api/v1/admin/users
adminRouter.get('/users', (req: AuthenticatedRequest, res: Response) => {
  const users = db.getAllUsers();
  const enriched = users.map((u) => {
    const accounts = db.getAccountsByOwnerId(u.id);
    const totalBalanceCents = accounts.reduce((sum, a) => sum + a.availableBalanceCents, 0);
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      roles: u.roles,
      status: u.status,
      phone: u.phone,
      accountsCount: accounts.length,
      totalBalanceFormatted: `$${(totalBalanceCents / 100).toFixed(2)}`,
      createdAt: u.createdAt
    };
  });

  return res.json({ users: enriched });
});

// PATCH /api/v1/admin/users/:userId/status
adminRouter.patch('/users/:userId/status', requireRole('ADMIN', 'COMPLIANCE_OFFICER'), (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params;
  const { status } = req.body;

  if (!['ACTIVE', 'SUSPENDED', 'FLAGGED'].includes(status)) {
    return res.status(400).json({ error: 'Invalid user status' });
  }

  const updated = db.updateUser(userId, { status });
  if (!updated) {
    return res.status(404).json({ error: 'User not found' });
  }

  db.recordAuditLog({
    actorId: req.user!.id,
    actorRole: req.user!.roles[0],
    actorEmail: req.user!.email,
    action: `USER_STATUS_CHANGE_${status}`,
    resourceType: 'USER',
    resourceId: userId,
    requestId: req.requestId || 'req_status_change',
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
    details: { newStatus: status }
  });

  return res.json({ success: true, user: updated });
});

// GET /api/v1/admin/transactions
adminRouter.get('/transactions', (req: AuthenticatedRequest, res: Response) => {
  const txns = db.getAllTransactions();
  return res.json({ transactions: txns });
});

// GET /api/v1/admin/audit-logs
adminRouter.get('/audit-logs', requireRole('ADMIN', 'COMPLIANCE_OFFICER'), (req: AuthenticatedRequest, res: Response) => {
  const logs = db.getAuditLogs();
  return res.json({ logs });
});

// GET /api/v1/admin/system-health
adminRouter.get('/system-health', (req: AuthenticatedRequest, res: Response) => {
  return res.json({
    status: 'HEALTHY',
    uptimeSeconds: Math.floor(process.uptime()),
    nodeVersion: process.version,
    memoryUsageMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
    databaseEngine: 'MongoDB Wire-Compatible InMemory Transactional Store',
    activeConnections: 14,
    apiLatencyMs: 18,
    lastCheckpoint: new Date().toISOString()
  });
});
