import { Router } from 'express';
// ⚠️ الحرف الكبير بـ `webHook` مقصود — لازم يطابق اسم الملف حرفيًا.
// ويندوز ما بيفرّق بين حالات الأحرف بأسماء الملفات، فأي غلطة هون بتضل خفية
// محليًا وبتفجّر السيرفر عند أول نشر على لينكس (ERR_MODULE_NOT_FOUND).
import { handleUserWebhook } from './user.webHook.controller.js';

const router = Router();

router.post('/', handleUserWebhook);

export default router;