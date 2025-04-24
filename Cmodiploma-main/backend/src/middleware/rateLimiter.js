const rateLimit = require('express-rate-limit');


const basicLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Слишком много запросов с этого IP, попробуйте позже'
});


const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Превышен лимит запросов для этой операции'
});

module.exports = {
    basicLimiter,
    strictLimiter
};
