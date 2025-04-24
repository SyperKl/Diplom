const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/queue_simulation', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB database connection established successfully'))
.catch(err => console.error('MongoDB connection error:', err));


const simulationsRouter = require('./routes/simulations');
const authRoutes = require('./routes/auth');


app.use('/api/simulations', simulationsRouter);
app.use('/api/auth', authRoutes);


app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
