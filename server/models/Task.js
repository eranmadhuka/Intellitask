// models/Task.js
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    dueDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['To do', 'In progress', 'Done'],
        default: 'To do'
    },
    // New fields
    category: {
        type: String,
        enum: ['Work', 'Personal', 'Meeting', 'Shopping', 'General'],
        default: 'General'
    },
    contactPerson: {
        type: String
    },
    // Existing timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Task', TaskSchema);