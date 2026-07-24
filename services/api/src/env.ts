import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  CORS_ORIGIN: z.string().default('http://localhost:8081'),
  ADMIN_API_URL: z.string().default(''),
  DATABASE_URL: z.string().default('postgresql://postgres:password@localhost:5432/autobidder'),
  STRIPE_SECRET_KEY: z.string().default('sk_test_51DummySecretKeyForDevOnly1234567890'),
  STRIPE_WEBHOOK_SECRET: z.string().default('whsec_dummy_key'),
  GOOGLE_MAPS_API_KEY: z.string().default('AIzaSyDummyKey'),
  JWT_SECRET: z.string().default('dev_secret_key_1234567890_change_me_in_production'),
  ADMIN_EMAIL: z.string().email().default('admin@autobidder.in'),
  ADMIN_PASSWORD: z.string().min(8).default('Admin@123'),
});

type Env = z.infer<typeof schema>;

export const env: Env = schema.parse({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  ADMIN_API_URL: process.env.ADMIN_API_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  JWT_SECRET: process.env.JWT_SECRET,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
});

/** Origins are comma-separated so a deployed admin panel and web client can both be allowed. */
export const corsOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean);

if (env.NODE_ENV === 'production') {
  const unsafeValues = new Set([
    'dev_secret_key_1234567890_change_me_in_production',
    'Admin@123',
    'sk_test_51DummySecretKeyForDevOnly1234567890',
    'AIzaSyDummyKey',
    'admin@autobidder.in',
  ]);
  const missingOrUnsafe = [
    ['JWT_SECRET', env.JWT_SECRET],
    ['ADMIN_PASSWORD', env.ADMIN_PASSWORD],
    ['STRIPE_SECRET_KEY', env.STRIPE_SECRET_KEY],
    ['GOOGLE_MAPS_API_KEY', env.GOOGLE_MAPS_API_KEY],
    ['ADMIN_EMAIL', env.ADMIN_EMAIL],
  ].filter(([, value]) => !value || unsafeValues.has(value));

  if (missingOrUnsafe.length || corsOrigins.includes('*')) {
    throw new Error(
      `Invalid production configuration: set secure ${missingOrUnsafe.map(([key]) => key).join(', ') || 'CORS_ORIGIN'} values and do not use a wildcard CORS origin.`
    );
  }
}
