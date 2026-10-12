import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { authRouter } from './server/routes/auth.routes';
import { accountRouter } from './server/routes/account.routes';
import { transactionRouter } from './server/routes/transaction.routes';
import { beneficiaryRouter } from './server/routes/beneficiary.routes';
import { analyticsRouter } from './server/routes/analytics.routes';
import { notificationRouter } from './server/routes/notification.routes';
import { aiRouter } from './server/routes/ai.routes';
import { adminRouter } from './server/routes/admin.routes';
import { eventsRouter } from './server/routes/events.routes';
import { docsRouter } from './server/routes/docs.routes';

async function bootstrapServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  // Security and parsing middlewares
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Security Headers
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Banking-Platform', 'NexaBank-AI-Core-v2.4');
    next();
  });

  // REST API Routes under /api/v1
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/accounts', accountRouter);
  app.use('/api/v1/transactions', transactionRouter);
  app.use('/api/v1/transfers', transactionRouter);
  app.use('/api/v1/beneficiaries', beneficiaryRouter);
  app.use('/api/v1/analytics', analyticsRouter);
  app.use('/api/v1/notifications', notificationRouter);
  app.use('/api/v1/ai', aiRouter);
  app.use('/api/v1/admin', adminRouter);
  app.use('/api/v1/events', eventsRouter);
  app.use('/api/v1/docs', docsRouter);

  // Health-check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'UP',
      service: 'NexaBank AI Banking Core',
      timestamp: new Date().toISOString()
    });
  });

  // Centralized Error Handler
  app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    console.error(`[NexaBank Error] ${req.method} ${req.url}:`, err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: isProduction ? 'An unexpected banking error occurred.' : err.message
    });
  });

  // Serve Frontend
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NexaBank AI] Server listening on http://0.0.0.0:${PORT}`);
  });
}

bootstrapServer().catch((err) => {
  console.error('[NexaBank AI] Fatal bootstrap error:', err);
  process.exit(1);
});
