const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';
const JWT_EXPIRES_IN = '24h';

exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('Запрос на регистрацию:', { username });


        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log('Пользователь с таким именем уже существует');
            return res.status(409).json({
                message: 'Пользователь с таким именем уже существует'
            });
        }


        const user = new User({ username, password });
        await user.save();
        console.log('Пользователь успешно создан');


        const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        console.log('Токен создан, отправка ответа');
        res.status(201).json({
            message: 'Пользователь успешно зарегистрирован',
            token,
            username: user.username
        });
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('Попытка входа:', { username });


        const user = await User.findOne({ username });
        if (!user) {
            console.log('Пользователь не найден');
            return res.status(401).json({ message: 'Неверное имя пользователя или пароль' });
        }


        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            console.log('Неверный пароль');
            return res.status(401).json({ message: 'Неверное имя пользователя или пароль' });
        }

        // Создание токена
        const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        console.log('Вход успешен, отправка токена');
        res.json({
            token,
            username: user.username,
            success: true
        });
    } catch (error) {
        console.error('Ошибка сервера при входе:', error);
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
};
