import express from 'express';
import rateLimit from 'express-rate-limit';
import { clearChatHistory, sendMessage } from '../controllers/chatMessage.js';

const router = express.Router();

// limit to prevent spam
const chatRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 20, 
  message: {
    success: false,
    error: 'Too many chat requests. Please wait a moment before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(chatRateLimit);

router.post('/message', sendMessage);
router.delete('/clear/:sessionId', clearChatHistory);

export default router;

