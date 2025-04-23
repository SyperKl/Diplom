// controllers/auth.js
import User, { findOne } from '../models/User';
import { sign } from 'jsonwebtoken';

// eslint-disable-next-line no-undef
const JWT_SECRET = process.env.JWT_SECRET || 'ваш_секретный_ключ';
const JWT_EXPIRES_IN = '24h';

export async function register(req, res) {
    try {
        const { username, password } = req.body;

        // Проверка, существует ли пользователь
        const existingUser = await findOne({ username });
        if (existingUser) {
            return res.status(409).json({
                message: 'Пользователь с таким именем уже существует'
            });
        }

        // Создание нового пользователя
        const user = new User({ username, password });
        await user.save();

        // Создание токена
        const token = sign(
            { id: user._id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.status(201).json({
            message: 'Пользователь успешно зарегистрирован',
            token
        });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
}

export async function login(req, res) {
    try {
        const { username, password } = req.body;

        // Поиск пользователя
        const user = await findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Неверное имя пользователя или пароль' });
        }

        // Проверка пароля
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Неверное имя пользователя или пароль' });
        }

        // Создание токена
        const token = sign(
            { id: user._id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
}
