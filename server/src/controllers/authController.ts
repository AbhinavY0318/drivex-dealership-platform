import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User.js';
import { generateTokens, verifyRefreshToken } from '../utils/token.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { registerSchema, loginSchema, refreshSchema } from '../validators/schemas.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export class AuthController {
  public static async register(req: Request, res: Response) {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, parsed.error.errors[0].message, 400);
      }

      const { name, email, password, phone, role = 'BUYER', showroomId } = parsed.data;

      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return sendError(res, 'An account with this email already exists', 409);
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = new User({
        name,
        email: email.toLowerCase(),
        passwordHash,
        role,
        phone,
        showroomId: showroomId || undefined,
      });

      const { accessToken, refreshToken } = generateTokens(user);
      user.refreshToken = refreshToken;
      await user.save();

      return sendSuccess(
        res,
        'Account registered successfully',
        {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            showroomId: user.showroomId,
          },
          tokens: {
            accessToken,
            refreshToken,
          },
        },
        201
      );
    } catch (err: any) {
      return sendError(res, 'Registration failed', 500, err);
    }
  }

  public static async login(req: Request, res: Response) {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, parsed.error.errors[0].message, 400);
      }

      const { email, password } = parsed.data;
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return sendError(res, 'Invalid email or password credentials', 401);
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return sendError(res, 'Invalid email or password credentials', 401);
      }

      const { accessToken, refreshToken } = generateTokens(user);
      user.refreshToken = refreshToken;
      await user.save();

      return sendSuccess(res, 'Logged in successfully', {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          showroomId: user.showroomId,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      });
    } catch (err: any) {
      return sendError(res, 'Login failed', 500, err);
    }
  }

  public static async refresh(req: Request, res: Response) {
    try {
      const parsed = refreshSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, parsed.error.errors[0].message, 400);
      }

      const { refreshToken } = parsed.data;
      const decoded = verifyRefreshToken(refreshToken);

      const user = await User.findById(decoded.userId);
      if (!user || user.refreshToken !== refreshToken) {
        return sendError(res, 'Invalid or revoked refresh token', 401);
      }

      const tokens = generateTokens(user);
      user.refreshToken = tokens.refreshToken;
      await user.save();

      return sendSuccess(res, 'Token refreshed successfully', {
        tokens,
      });
    } catch (err: any) {
      return sendError(res, 'Token refresh failed', 401, err);
    }
  }

  public static async logout(req: AuthRequest, res: Response) {
    try {
      if (req.user) {
        await User.findByIdAndUpdate(req.user.userId, { refreshToken: undefined });
      }
      return sendSuccess(res, 'Logged out successfully');
    } catch (err: any) {
      return sendError(res, 'Logout failed', 500, err);
    }
  }

  public static async getMe(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Authentication required', 401);
      }

      const user = await User.findById(req.user.userId).populate('showroomId');
      if (!user) {
        return sendError(res, 'User not found', 404);
      }

      return sendSuccess(res, 'Profile retrieved', {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        showroomId: user.showroomId,
        activeLeadCount: user.activeLeadCount,
        isAvailable: user.isAvailable,
      });
    } catch (err: any) {
      return sendError(res, 'Failed to fetch user profile', 500, err);
    }
  }
}
