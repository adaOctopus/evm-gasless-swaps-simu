import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT ?? '4000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  mongoUri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/gasless-swap',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret',
  alchemy: {
    apiKey: process.env.ALCHEMY_API_KEY ?? '',
    bundlerUrl: process.env.ALCHEMY_BUNDLER_URL ?? '',
  },
  gasManager: {
    policyIdFree: process.env.GAS_MANAGER_POLICY_ID_FREE ?? '',
    policyIdPro: process.env.GAS_MANAGER_POLICY_ID_PRO ?? '',
    policyIdMaster: process.env.GAS_MANAGER_POLICY_ID_MASTER ?? '',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
  },
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
} as const;

export type UserTier = 'FREE' | 'PRO' | 'MASTER';
