import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(8000),

  // محلي: mongodb://127.0.0.1:27017/qaren
  // Atlas: mongodb+srv://user:pass@cluster.xxxxx.mongodb.net/qaren?retryWrites=true&w=majority
  // ⚠️ اسم قاعدة البيانات لازم يكون بالرابط (قبل علامة الاستفهام) — رابط
  // Atlas المنسوخ من الموقع بيجي بلا اسم، وبدونه كل شي بينكتب بقاعدة `test`
  MONGO_URI: z.url(),

  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_WEBHOOK_SECRET: z.string().min(1), // whsec_...

  SERPAPI_KEY: z.string().min(1),

  GEMINI_API_KEY: z.string().min(1),
  // قابل للتغيير من .env بدون لمس الكود — أسماء موديلات Gemini بتتغير مع الوقت.
  //
  // الافتراضي موديل lite عن قصد: الحصة المجانية منفصلة لكل موديل، وحصة
  // gemini-3.7-flash ضيقة (20 طلب/يوم) وبتخلص بنص يوم تطوير — وقتها كل نداء
  // بيرجع 429. اسم ثابت مش `-latest` لأن الأسماء المتحركة بتتبدّل بلا إشعار
  GEMINI_MODEL: z.string().min(1).default('gemini-3.1-flash-lite'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid or missing environment variables:');
  console.error(parsed.error.flatten().fieldErrors); 
  process.exit(1);
}

export const env = parsed.data;