const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
require('dotenv').config();

const { protect, admin } = require('./middleware/authMiddleware');
const Complaint = require('./models/Complaint');

const app = express();
const PORT = process.env.PORT || 5002;
const MONGO_URI = process.env.COMPLAINT_MONGO_URI;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint for Docker
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Utility to trigger notification (Non-blocking)
const notify = (payload) => {
    const NOTIFICATION_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:5003/log';
    fetch(NOTIFICATION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).catch(err => console.error('[NOTIFY-FAILED]', err.message));
};

// 1. Create a internal complaint
app.post(['/', '/test'], protect, async (req, res) => {
    console.log(`[REQUEST] POST /complaints - User: ${req.user.id}`);
    try {
        const { subject, description, category, visibility } = req.body;

        if (!category) {
            console.log('[REJECTED] Missing category');
            return res.status(400).json({ error: 'Category is required' });
        }

        console.log('[DB-START] Saving complaint to Mongo...');
        const complaint = await Complaint.create({
            subject,
            description,
            category,
            visibility: visibility === 'Public' ? 'Public' : 'Private',
            userId: req.user.id,
            statusHistory: [{ status: 'Pending', changedAt: new Date() }]
        });
        console.log('[DB-SUCCESS] Complaint created:', complaint._id);

        notify({
            event: 'COMPLAINT_CREATED',
            message: `New complaint submitted: "${subject}"`,
            forRole: 'admin',
            type: 'new_complaint',
            complaintId: complaint._id.toString(),
            complaintTitle: subject
        });

        res.status(201).json(complaint);
    } catch (error) {
        console.error('[SERVER-ERROR]', error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

// 2. Fetch public complaints (For Student Dashboard)
app.get('/', protect, async (req, res) => {
    try {
        const complaints = await Complaint.find({ visibility: 'Public' })
            .populate('userId', 'fullName ucn')
            .sort({ createdAt: -1 });

        res.json(complaints);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// 3. Fetch personal complaints
app.get('/user', protect, async (req, res) => {
    try {
        const complaints = await Complaint.find({ userId: req.user.id })
            .populate('userId', 'fullName ucn')
            .sort({ createdAt: -1 });

        res.json(complaints);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// 4. Admin fetch all complaints
app.get('/admin', protect, admin, async (req, res) => {
    try {
        const complaints = await Complaint.find({})
            .populate('userId', 'fullName ucn')
            .sort({ createdAt: -1 });

        res.json(complaints);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// 5. Admin update complaint status
app.put('/:id', protect, admin, async (req, res) => {
    try {
        const { status } = req.body;
        // Push new entry into statusHistory and update status
        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            {
                status,
                $push: { statusHistory: { status, changedAt: new Date() } }
            },
            { new: true }
        ).populate('userId', 'fullName ucn');

        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        notify({
            event: 'STATUS_UPDATED',
            message: `Your complaint "${complaint.subject}" status changed to: ${status}`,
            userId: complaint.userId._id ? complaint.userId._id.toString() : complaint.userId.toString(),
            forRole: 'student',
            type: 'status_change',
            complaintId: complaint._id.toString(),
            complaintTitle: complaint.subject
        });

        res.json(complaint);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Connect logic
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('📦 Connected to MongoDB (Complaint Service)');
    })
    .catch(err => {
        console.error('❌ Database connection error (Complaint Service):', err.message);
    });

app.listen(PORT, () => console.log(`🚀 Complaint Service running on port ${PORT}`));
