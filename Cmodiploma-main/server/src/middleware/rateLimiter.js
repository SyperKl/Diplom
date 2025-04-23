// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

// Базовый ограничитель
const basicLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100, // максимум 100 запросов за период
    standardHeaders: true, // возвращать стандартные RateLimit заголовки
    legacyHeaders: false, // отключить устаревшие заголовки X-RateLimit
    message: 'Слишком много запросов с этого IP, попробуйте позже'
});

// Более строгий ограничитель для чувствительных операций
const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 час
    max: 10, // максимум 10 запросов за период
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Превышен лимит запросов для этой операции'
});

module.exports = {
    basicLimiter,
    strictLimiter
};