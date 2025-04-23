const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Подключите маршруты после объявления app
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/queue_simulation', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
