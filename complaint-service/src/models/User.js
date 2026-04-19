const mongoose = require('mongoose');

// Minimal User schema — only needed so that Mongoose can .populate() the userId
// field in Complaint documents. The full schema with password hashing lives in
// auth-service; this is a read-only mirror.
const userSchema = new mongoose.Schema({
    fullName: { type: String },
    ucn:      { type: String },
    email:    { type: String },
    role:     { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
