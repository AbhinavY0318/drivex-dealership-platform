import jwt from 'jsonwebtoken';
import { config } from '../config/environment.js';
import { IUser, UserRole } from '../models/User.js';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  showroomId?: string;
  name: string;
}

export const generateTokens = (user: IUser) => {
  const payload: JwtPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    showroomId: user.showroomId?.toString(),
    name: user.name,
  };

  const accessToken = jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as any,
  });

  const refreshToken = jwt.sign(payload, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpiresIn as any,
  });

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwtRefreshSecret) as JwtPayload;
};
