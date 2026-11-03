import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongodbUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || 'drivex_super_secret_jwt_access_key_replace_in_production_2026',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'drivex_super_secret_jwt_refresh_key_replace_in_production_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  dealershipCity: process.env.DEALERSHIP_CITY || 'Lucknow',
  dealershipState: process.env.DEALERSHIP_STATE || 'Uttar Pradesh',
  slaResponseTimeMinutes: parseInt(process.env.SLA_RESPONSE_TIME_MINUTES || '5', 10),
};
