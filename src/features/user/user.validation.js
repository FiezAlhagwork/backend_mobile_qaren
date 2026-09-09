import { z } from 'zod';
import {
  SUPPORTED_CITIES,
  SUPPORTED_COUNTRY,
} from '../../shared/constants/saudiCities.js';

// المدينة لازم تكون وحدة من يلي SerpAPI بتعرفها — إذا انحفظت مدينة غير مدعومة،
// كل بحث بعدها بيرجّع 502 غامضة لأن SerpAPI بترفض الموقع. أحسن ترفض هون
// برسالة واضحة من إنه المستخدم يكتشف الكسر بعدين وما يعرف السبب.
export const updateLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  city: z
    .string()
    .min(1)
    .refine((value) => SUPPORTED_CITIES.includes(value), {
      message: `Unsupported city. Supported cities: ${SUPPORTED_CITIES.join(', ')}`,
    }),
  country: z.literal(SUPPORTED_COUNTRY, {
    message: `Only ${SUPPORTED_COUNTRY} is supported`,
  }),
  source: z.enum(['gps', 'manual']),
});


export const updatePushTokenSchema = z.object({
  pushToken: z.string().min(1),
}).strict();

// الكرون بيقرأ preferences.pushNotificationsEnabled قبل ما يبعت أي إشعار،
// بس ما كان في مسار لتعديله — فالمستخدم عمرو ما قدر يطفي الإشعارات
export const updatePreferencesSchema = z.object({
  pushNotificationsEnabled: z.boolean(),
}).strict();