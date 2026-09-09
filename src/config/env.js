import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),

  MONGO_URI: z.url(), // local: mongodb://127.0.0.1:27017/qaren

  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_WEBHOOK_SECRET: z.string().min(1), // whsec_...

  SERPAPI_KEY: z.string().min(1),

  GEMINI_API_KEY: z.string().min(1),
  // قابل للتغيير من .env بدون لمس الكود — أسماء موديلات Gemini بتتغير مع الوقت
  GEMINI_MODEL: z.string().min(1).default('gemini-3.7-flash'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid or missing environment variables:');
  console.error(parsed.error.flatten().fieldErrors); 
  process.exit(1);
}

export const env = parsed.data;