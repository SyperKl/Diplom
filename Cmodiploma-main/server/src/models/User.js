// server/src/models/User.js

// Правильно импортируем mongoose и bcrypt
import { Schema, model } from 'mongoose';
import { genSalt, hash, compare } from 'bcrypt';

// Определяем схему пользователя, используя mongoose.Schema вместо просто Schema
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Хеширование пароля перед сохранением
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await genSalt(10);
        this.password = await hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Метод сравнения паролей
userSchema.methods.comparePassword = async function(candidatePassword) {
    return compare(candidatePassword, this.password);
};

// Экспортируем модель
export default model('User', userSchema);
