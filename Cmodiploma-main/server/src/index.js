"use strict";

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Инициализируем приложение Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/queue_simulation', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB успешно подключена'))
.catch(err => console.error('Ошибка подключения к MongoDB:', err));

// Инициализация роутов - только после объявления app
const simulationsRouter = require('./routes/simulations');
const authRoutes = require('./routes/auth');

// Использование роутов
app.use('/api/simulations', simulationsRouter);
app.use('/api/auth', authRoutes);

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Что-то пошло не так!' });
    next(); // Вызываем next для продолжения обработки
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту: ${PORT}`);
});
