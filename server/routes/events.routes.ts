import { Router, Response } from 'express';
import { bankEventEmitter } from '../db';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth.middleware';

export const eventsRouter = Router();

// GET /api/v1/events - Server-Sent Events stream
eventsRouter.get('/', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  // Initial connection acknowledgement
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'SSE Stream active for user ' + user.id, timestamp: new Date().toISOString() })}\n\n`);

  // Event listener for banking events
  const onBankEvent = (event: { type: string; userId: string; data: unknown }) => {
    // Only send if belongs to this user or if user is Admin
    if (event.userId === user.id || user.roles.includes('ADMIN')) {
      res.write(`event: ${event.type}\n`);
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }
  };

  bankEventEmitter.on('bank_event', onBankEvent);

  // Keep-alive heartbeat every 20 seconds
  const heartbeatTimer = setInterval(() => {
    res.write(`: heartbeat\n\n`);
  }, 20000);

  req.on('close', () => {
    clearInterval(heartbeatTimer);
    bankEventEmitter.off('bank_event', onBankEvent);
  });
});
