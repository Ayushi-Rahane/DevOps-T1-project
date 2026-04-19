const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    visibility: {
        type: String,
        enum: ['Public', 'Private'],
        default: 'Private',
    },
    status: {
        type: String,
        default: 'Pending',
    },
    statusHistory: [
        {
            status: String,
            changedAt: Date
        }
    ],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
