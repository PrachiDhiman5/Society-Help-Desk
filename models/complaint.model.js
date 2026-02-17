import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    flatNo: {
        type: String,
        required: true
    },
    wing: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'resolved', 'rejected'],
        default: 'pending'
    },
    adminResponse: {
        type: String,
        default: ''
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint;
