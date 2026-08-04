import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../../types';
import { db } from '../db';

const JWT_SECRET = process.env.JWT_SECRET || 'connexa_super_secret_jwt_key_2026';

export interface AuthRequest extends Request {
  user?: User;
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: UserRole };
    const user = await db.findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Invalid session user or account no longer exists.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired authentication token.' });
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden. Role '${req.user.role}' does not have permission to perform this action.`,
      });
    }

    next();
  };
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}
