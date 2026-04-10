import rateLimit from 'express-rate-limit';

const handler = (message) => (_req, res) => {
  res.status(429).json({ success: false, message });
};

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: handler('Too many attempts, please try again after 15 minutes'),
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: handler('Too many requests, slow down'),
});
