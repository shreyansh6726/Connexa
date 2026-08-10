import bcrypt from 'bcryptjs';
import { Response } from 'express';
import { db } from '../db';
import { AuthRequest, generateToken } from '../middleware/auth';

export class AuthController {
  public static async register(req: AuthRequest, res: Response) {
    try {
      const { name, email, password, role, companyName } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required.' });
      }

      const existing = await db.findUserByEmail(email);
      if (existing) {
        return res.status(400).json({ message: 'An account with this email address already exists.' });
      }

      const passwordHash = bcrypt.hashSync(password, 10);
      const userRole = role === 'EMPLOYER' || role === 'ADMIN' ? role : 'EMPLOYEE';

      const newUser = await db.createUser(
        {
          name,
          email,
          role: userRole,
          companyName,
        },
        passwordHash
      );

      const token = generateToken(newUser);

      return res.status(201).json({
        user: newUser,
        token,
      });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error registering user.' });
    }
  }

  public static async login(req: AuthRequest, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
      }

      const user = await db.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials. User not found.' });
      }

      const isValid = await db.verifyPassword(email, password);
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      const token = generateToken(user);

      return res.json({
        user,
        token,
      });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error logging in.' });
    }
  }

  public static async me(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }
    return res.json({ user: req.user });
  }

  public static async updateProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated.' });
      }

      const { name, companyName, contactDetails, profile } = req.body;

      const updated = await db.updateUser(req.user._id, {
        ...(name ? { name } : {}),
        ...(companyName !== undefined ? { companyName } : {}),
        ...(contactDetails ? { contactDetails } : {}),
        ...(profile ? { profile } : {}),
      });

      return res.json({ user: updated });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error updating profile.' });
    }
  }
}
