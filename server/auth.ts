import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export type UserRole = 'user' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  handle: string;
  role: UserRole;
  passwordHash: string;
  createdAt: string;
}

export interface SessionData {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    handle: string;
    role: UserRole;
  };
  expiresAt: number;
}

// Simple salt + hash helper using built-in crypto
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(`yapout_salt_2026_${password}`).digest('hex');
}

export class AuthManager {
  private users: Map<string, AuthUser> = new Map();
  private sessions: Map<string, SessionData> = new Map();

  constructor() {
    this.seedDefaultUsers();
  }

  private getAdminEmailsFromEnv(): Set<string> {
    const envEmails = process.env.ADMIN_EMAILS || '';
    const list = envEmails.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
    // Hardened administrator whitelist: includes system admin and verified owner
    list.push('admin@yapout.com', 'unnatisri2007@gmail.com');
    return new Set(list);
  }

  private seedDefaultUsers() {
    // Regular public user (matches current sample user Alex Rivera)
    const regularUser: AuthUser = {
      id: 'user-curr-1',
      email: 'alex@yapout.local',
      name: 'Alex Rivera',
      handle: '@alexr',
      role: 'user',
      passwordHash: hashPassword('user123'),
      createdAt: '2026-09-01T12:00:00Z',
    };
    this.users.set(regularUser.email.toLowerCase(), regularUser);

    // Explicitly designated Administrator account
    const adminUser: AuthUser = {
      id: 'admin-root-1',
      email: 'admin@yapout.com',
      name: 'YapOut Operations Lead',
      handle: '@yapadmin',
      role: 'admin',
      passwordHash: hashPassword('AdminYapOut2026!'),
      createdAt: '2026-08-01T08:00:00Z',
    };
    this.users.set(adminUser.email.toLowerCase(), adminUser);

    // Primary Owner Administrator account (Unnati Srivastava)
    const ownerAdminUser: AuthUser = {
      id: 'admin-owner-1',
      email: 'unnatisri2007@gmail.com',
      name: 'Unnati Srivastava (Administrator)',
      handle: '@unnati_admin',
      role: 'admin',
      passwordHash: hashPassword('AdminYapOut2026!'),
      createdAt: '2026-10-25T08:00:00Z',
    };
    this.users.set(ownerAdminUser.email.toLowerCase(), ownerAdminUser);
  }

  public authenticate(email: string, password: string): AuthUser | null {
    if (!email || !password) return null;
    const user = this.users.get(email.toLowerCase().trim());
    if (!user) return null;

    const testHash = hashPassword(password);
    if (user.passwordHash !== testHash) {
      return null;
    }

    return user;
  }

  public createSession(user: AuthUser, durationMs = 24 * 60 * 60 * 1000): SessionData {
    const token = `yaptk_${crypto.randomBytes(32).toString('hex')}`;
    const session: SessionData = {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        handle: user.handle,
        role: user.role,
      },
      expiresAt: Date.now() + durationMs,
    };
    this.sessions.set(token, session);
    return session;
  }

  public validateSession(token: string): SessionData | null {
    if (!token) return null;
    const session = this.sessions.get(token);
    if (!session) return null;

    if (Date.now() > session.expiresAt) {
      this.sessions.delete(token);
      return null;
    }

    return session;
  }

  public revokeSession(token: string): boolean {
    if (!token) return false;
    return this.sessions.delete(token);
  }

  // Registration: grants 'admin' role if listed in server ADMIN_EMAILS whitelist, otherwise 'user'
  // Public users cannot pass their own role parameter to escalate privileges
  public registerUser(name: string, email: string, password: string, handle?: string): AuthUser {
    const normalizedEmail = email.toLowerCase().trim();
    if (this.users.has(normalizedEmail)) {
      throw new Error('An account with this email address already exists.');
    }

    const isAdminWhitelist = this.getAdminEmailsFromEnv().has(normalizedEmail);
    const assignedRole: UserRole = isAdminWhitelist ? 'admin' : 'user';

    const newUser: AuthUser = {
      id: `user-${Date.now()}`,
      email: normalizedEmail,
      name: name.trim(),
      handle: handle?.trim() || `@${normalizedEmail.split('@')[0]}`,
      role: assignedRole,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    this.users.set(normalizedEmail, newUser);
    return newUser;
  }

  // Assign or promote/demote a user role
  public setUserRole(email: string, role: UserRole): AuthUser {
    const normalizedEmail = email.toLowerCase().trim();
    const user = this.users.get(normalizedEmail);
    if (!user) {
      throw new Error(`User with email "${email}" not found.`);
    }
    user.role = role;
    this.users.set(normalizedEmail, user);
    return user;
  }

  // Securely bootstrap or reset administrator credentials
  public bootstrapAdmin(email: string, password: string, name?: string): AuthUser {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = this.users.get(normalizedEmail);

    if (existing) {
      existing.role = 'admin';
      existing.passwordHash = hashPassword(password);
      if (name) existing.name = name.trim();
      this.users.set(normalizedEmail, existing);
      return existing;
    }

    const newAdmin: AuthUser = {
      id: `admin-${Date.now()}`,
      email: normalizedEmail,
      name: name?.trim() || 'System Administrator',
      handle: `@${normalizedEmail.split('@')[0]}`,
      role: 'admin',
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };
    this.users.set(normalizedEmail, newAdmin);
    return newAdmin;
  }

  public getUserByEmail(email: string): AuthUser | null {
    return this.users.get(email.toLowerCase().trim()) || null;
  }

  public getUserById(id: string): AuthUser | null {
    for (const u of this.users.values()) {
      if (u.id === id) return u;
    }
    return null;
  }

  public getAllUsers() {
    return Array.from(this.users.values()).map(({ passwordHash, ...rest }) => rest);
  }
}

export const authManager = new AuthManager();

// Server-side middleware to protect all administrative endpoints
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const adminHeader = req.headers['x-admin-token'] as string | undefined;

  let token: string | undefined;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (adminHeader) {
    token = adminHeader.trim();
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Admin authentication token is required.',
    });
  }

  const session = authManager.validateSession(token);
  if (!session) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid or expired administrator session.',
    });
  }

  if (session.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Administrator privileges required. Access denied.',
    });
  }

  (req as any).adminSession = session;
  (req as any).adminUser = session.user;
  next();
}
