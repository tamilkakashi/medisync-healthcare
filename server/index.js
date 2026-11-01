const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

dotenv.config();

// Avoid buffering queries indefinitely if MongoDB is offline
mongoose.set('bufferCommands', false);

// Prevent unhandled error event crash from background reconnection attempts
mongoose.connection.on('error', (err) => {
    // Background retry error safely handled
});

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason?.message || reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err?.message || err);
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:5173'], // Vite default port
    credentials: true
}));

// Database Connection
const promptConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 2500 });
        console.log('MongoDB Connected Successfully');
    } catch (error) {
        console.error('MongoDB Connection Failed:', error.message);
        console.log('[MediSync] Switched to Offline Mock Database Engine with persistent storage.');
    }
};
promptConnection();

// Routes Placeholder
app.get('/', (req, res) => {
    res.send('MediSync API is Running');
});

// Routes
const authRoutes = require('./routes/authRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/hospital', hospitalRoutes);

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

server.on('error', (err) => {
    console.error('Server listen error:', err.message);
});
