import { Router } from 'express';
import { handleUserWebhook } from './user.webhook.controller.js';

const router = Router();

router.post('/', handleUserWebhook);

export default router;