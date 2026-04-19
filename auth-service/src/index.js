const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.AUTH_MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secure_issuesphere_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint for Docker
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Utility function to generate JWT
const generateToken = (userId, role) => {
    return jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

app.post('/register', async (req, res) => {
    try {
        const { fullName, ucn, degree, year, branch, phone, email, password, role } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ $or: [{ email }, { ucn }] });
        if (userExists) {
            return res.status(400).json({ error: 'User with this email or UCN already exists.' });
        }

        const user = await User.create({
            fullName, ucn, degree, year, branch, phone, email, password, role
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ error: 'Server error during registration.' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }

        const token = generateToken(user._id, user.role);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                ucn: user.ucn,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Server error during login.' });
    }
});

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('📦 Connected to MongoDB (Auth DB)');
    })
    .catch(err => {
        console.error('❌ Database connection error (Auth DB):', err.message);
    });

app.listen(PORT, () => console.log(`🚀 Auth Service running on port ${PORT}`));
