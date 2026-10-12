import { Router, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db';
import { AuthenticatedRequest, createSessionToken, authMiddleware } from '../middleware/auth.middleware';

export const authRouter = Router();

// POST /api/v1/auth/register
authRouter.post('/register', (req: AuthenticatedRequest, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email address already exists' });
  }

  const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
  const newUser = db.createUser({
    name,
    email,
    passwordHash,
    roles: ['CUSTOMER'],
    status: 'ACTIVE'
  });

  const token = createSessionToken(newUser.id);

  db.recordAuditLog({
    actorId: newUser.id,
    actorRole: 'CUSTOMER',
    actorEmail: newUser.email,
    action: 'USER_REGISTRATION',
    resourceType: 'USER',
    resourceId: newUser.id,
    requestId: req.requestId || 'req_reg',
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS'
  });

  const { passwordHash: _, ...userSafe } = newUser;
  return res.status(201).json({
    token,
    user: userSafe,
    message: 'Account created successfully with default Checking account.'
  });
});

// POST /api/v1/auth/login
authRouter.post('/login', (req: AuthenticatedRequest, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (user.status === 'SUSPENDED') {
    return res.status(403).json({ error: 'Account suspended. Please contact Compliance Support.' });
  }

  // Hash check or demo password bypass
  const inputHash = crypto.createHash('sha256').update(password).digest('hex');
  const isMatch = inputHash === user.passwordHash || password === 'NexaBank#2026!' || password === 'password123';

  if (!isMatch) {
    db.recordAuditLog({
      actorId: user.id,
      actorRole: user.roles[0],
      actorEmail: user.email,
      action: 'LOGIN_FAILURE',
      resourceType: 'AUTH',
      requestId: req.requestId || 'req_login_fail',
      ipAddress: req.ip || '127.0.0.1',
      status: 'FAILURE'
    });
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = createSessionToken(user.id);

  db.recordAuditLog({
    actorId: user.id,
    actorRole: user.roles[0],
    actorEmail: user.email,
    action: 'LOGIN_SUCCESS',
    resourceType: 'AUTH',
    resourceId: user.id,
    requestId: req.requestId || 'req_login_ok',
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS'
  });

  const { passwordHash: _, ...userSafe } = user;
  return res.json({
    token,
    user: userSafe
  });
});

// POST /api/v1/auth/switch-demo-persona
authRouter.post('/switch-demo-persona', (req: AuthenticatedRequest, res: Response) => {
  const { role } = req.body;
  const roleMap: Record<string, string> = {
    CUSTOMER: 'usr_alex_morgan',
    SUPPORT_AGENT: 'usr_sarah_jenkins',
    COMPLIANCE_OFFICER: 'usr_elena_rostova',
    ADMIN: 'usr_marcus_vance'
  };

  const userId = roleMap[role as string] || 'usr_alex_morgan';
  const user = db.getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'Demo persona not found' });
  }

  const token = createSessionToken(user.id);
  const { passwordHash: _, ...userSafe } = user;

  db.recordAuditLog({
    actorId: user.id,
    actorRole: user.roles[0],
    actorEmail: user.email,
    action: 'DEMO_PERSONA_SWITCH',
    resourceType: 'AUTH',
    requestId: req.requestId || 'req_persona_switch',
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
    details: { switchedTo: role }
  });

  return res.json({
    token,
    user: userSafe
  });
});

// GET /api/v1/auth/me
authRouter.get('/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { passwordHash: _, ...userSafe } = req.user;
  return res.json({ user: userSafe });
});

// POST /api/v1/auth/logout
authRouter.post('/logout', (req: AuthenticatedRequest, res: Response) => {
  return res.json({ success: true, message: 'Successfully signed out' });
});

// POST /api/v1/auth/forgot-password (demo simulated workflow)
authRouter.post('/forgot-password', (req: AuthenticatedRequest, res: Response) => {
  const { email } = req.body;
  return res.json({
    success: true,
    message: `Password reset simulation link dispatched to ${email || 'your email'}. Recovery token: NB-RST-2026-X8.`
  });
});

// POST /api/v1/auth/reset-password
authRouter.post('/reset-password', (req: AuthenticatedRequest, res: Response) => {
  return res.json({
    success: true,
    message: 'Your password has been successfully reset. You may now log in.'
  });
});
