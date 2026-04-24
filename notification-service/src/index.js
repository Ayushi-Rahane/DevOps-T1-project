const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5003; // 5003 is the default port for the notification service
const MONGO_URI = process.env.NOTIFICATION_MONGO_URI || 'mongodb://mongodb:27017/issuesphere_db';
const JWT_SECRET = process.env.JWT_SECRET || 'super_secure_issuesphere_secret_key';

app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // This is code line

// ── Notification Model ──────────────────────────────────────────
const notificationSchema = new mongoose.Schema({
    // null = broadcast to all admins
    userId: { type: mongoose.Schema.Types.ObjectId, default: null }, // null = broadcast to all admins
    forRole: { type: String, enum: ['student', 'admin', 'all'], default: 'admin' }, // admin = broadcast to all admins, student = broadcast to all students, all = broadcast to all students and admins
    message: { type: String, required: true },
    type: { type: String, enum: ['new_complaint', 'status_change', 'general'], default: 'general' },
    complaintId: { type: String, default: null },
    complaintTitle: { type: String, default: '' },
    isRead: { type: Boolean, default: false },
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

// ── Auth Middleware ─────────────────────────────────────────────
const protect = (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token' });
    }
    try {
        req.user = jwt.verify(auth.split(' ')[1], JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// ── Internal route: called by complaint-service ─────────────────
// POST /log  { event, message, userId, complaintId, complaintTitle, forRole, type }
app.post('/log', async (req, res) => {
    const { event, message, userId, complaintId, complaintTitle, forRole, type } = req.body;
    console.log(`[EVENT: ${event}] ${message}`);
    try {
        await Notification.create({
            userId: userId || null,
            forRole: forRole || 'admin',
            message,
            type: type || 'general',
            complaintId: complaintId || null,
            complaintTitle: complaintTitle || '', // here it is written as complaintTitle not complaint_title , this is code line 
        });
        res.status(201).json({ status: 'Notification saved' });
    } catch (err) {
        console.error('Failed to save notification:', err.message);
        res.status(500).json({ error: err.message });
    } // test change
});

// ── GET /  → fetch notifications for the logged-in user ──────────
app.get('/', protect, async (req, res) => {
    try {
        const { id: userId, role } = req.user;
        let query;

        if (role === 'admin') {
            // Admin sees broadcast-to-admin notifications
            query = { forRole: { $in: ['admin', 'all'] } };
        } else {
            // Student sees notifications addressed to them specifically
            query = { userId: new mongoose.Types.ObjectId(userId) };
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(30);

        res.json(notifications);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// ── PUT /:id/read → mark a notification as read ───────────────────
app.put('/:id/read', protect, async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        res.json({ status: 'marked read' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── PUT /read-all → mark all as read for current user ─────────────
app.put('/read-all', protect, async (req, res) => {
    try {
        const { id: userId, role } = req.user;
        const query = role === 'admin'
            ? { forRole: { $in: ['admin', 'all'] }, isRead: false }
            : { userId: new mongoose.Types.ObjectId(userId), isRead: false };
        await Notification.updateMany(query, { isRead: true });
        res.json({ status: 'all marked read' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Connect to MongoDB then start
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('📦 Connected to MongoDB (Notification Service)');
    })
    .catch(err => console.error('❌ DB Error (Notification):', err.message));

app.listen(PORT, () => console.log(`🚀 Notification Service running on port ${PORT}`));
