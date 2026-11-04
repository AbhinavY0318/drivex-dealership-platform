import dotenv from 'dotenv';
import path from 'path';

// Load root and server .env files in order of precedence
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_ORIGIN || process.env.CLIENT_URL || 'http://localhost:5173',
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

export const validateEnvironment = (): void => {
  const isProduction = config.nodeEnv === 'production';

  if (isProduction) {
    const missing: string[] = [];

    if (!config.mongodbUri) {
      missing.push('MONGODB_URI (Production requires an external MongoDB database, such as MongoDB Atlas)');
    }
    if (!process.env.JWT_SECRET || config.jwtSecret.includes('replace_in_production')) {
      missing.push('JWT_SECRET (Production requires a dedicated, cryptographically strong secret)');
    }
    if (!process.env.JWT_REFRESH_SECRET || config.jwtRefreshSecret.includes('replace_in_production')) {
      missing.push('JWT_REFRESH_SECRET (Production requires a dedicated, cryptographically strong refresh secret)');
    }

    if (missing.length > 0) {
      console.error('====================================================');
      console.error('🚨 [DriveX Configuration Error] Missing Mandatory Production Environment Variables:');
      missing.forEach((item) => console.error(`  - ${item}`));
      console.error('====================================================');
      throw new Error(`Startup failed: Missing ${missing.length} mandatory production environment variable(s).`);
    }
  }

  // Diagnostic notifications (non-blocking)
  if (!config.geminiApiKey && config.nodeEnv !== 'test') {
    console.info('[Configuration] Notice: GEMINI_API_KEY is not set. Deterministic rule-based fallback active for AI features.');
  }
};
