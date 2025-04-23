// middleware/auth.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ваш_секретный_ключ';

module.exports = (req, res, next) => {
    // Получение токена из заголовка
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Требуется аутентификация' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Верификация токена
        const decoded = jwt.verify(token, JWT_SECRET);

        // Добавление пользователя в объект запроса
        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Недействительный токен или срок его действия истек'
        });
    }
};
