const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
// index.js
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/queue_simulation', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const connection = mongoose.connection;
connection.once('open', () => {
    console.log('MongoDB database connection established successfully');
});

// Routes
const simulationsRouter = require('./routes/simulations');
app.use('/api/simulations', simulationsRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});