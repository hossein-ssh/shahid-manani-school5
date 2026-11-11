import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { User, UserRole } from '../src/types';

// In-memory / persistent session map: token -> { userId: string, expiresAt: number }
interface SessionData {
  userId: string;
  role: UserRole;
  expiresAt: number;
}

const sessions = new Map<string, SessionData>();

// Session TTL: 7 days
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch (err) {
    return false;
  }
}

export function createSession(userId: string, role: UserRole): string {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, {
    userId,
    role,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  return token;
}

export function getSession(token: string): SessionData | null {
  const session = sessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }
  return session;
}

export function revokeSession(token: string): void {
  sessions.delete(token);
}

export interface AuthenticatedRequest extends Request {
  user?: User;
  token?: string;
}

// Global user resolver hook for auth middleware
let userResolver: ((userId: string) => Promise<User | null> | User | null) | null = null;

export function registerUserResolver(resolver: (userId: string) => Promise<User | null> | User | null) {
  userResolver = resolver;
}

export async function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : (req.cookies?.session_token || (req.headers['x-session-token'] as string));

  if (!token) {
    return next();
  }

  const session = getSession(token);
  if (!session) {
    return next();
  }

  if (userResolver) {
    const user = await userResolver(session.userId);
    if (user && user.status === 'active') {
      req.user = user;
      req.token = token;
    }
  }

  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: 'لطفاً ابتدا وارد حساب کاربری خود شوید (نشست کاربری نامعتبر است)',
      code: 'UNAUTHORIZED'
    });
  }
  next();
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'لطفاً ابتدا وارد حساب کاربری خود شوید',
        code: 'UNAUTHORIZED'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'شما دسترسی لازم برای انجام این عملیات را ندارید',
        code: 'FORBIDDEN'
      });
    }

    next();
  };
}
