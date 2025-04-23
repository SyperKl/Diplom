import express, { json } from 'express';
import cors from 'cors';
import { connect } from 'mongoose';
// eslint-disable-next-line no-undef
require('dotenv').config();

const app = express();
// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(json());

// MongoDB connection
// eslint-disable-next-line no-undef
connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/queue_simulation', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB database connection established successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes - импортировать после инициализации app
import simulationsRouter from './routes/simulations';
import authRoutes from './routes/auth';

app.use('/api/simulations', simulationsRouter);
app.use('/api/auth', authRoutes);

// Global error handler
app.use((err, req, res) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
