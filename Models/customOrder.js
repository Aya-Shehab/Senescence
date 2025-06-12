import mongoose from 'mongoose';

const customOrderSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    address: {
        type: String,
        required: [true, 'Delivery address is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Order description is required'],
        trim: true
    },
    imageUrl: {
        type: String,
        default: null
    },
    preferredDate: {
        type: Date,
        default: null
    },
    notes: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'cancelled'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const customOrder = mongoose.model('CustomOrder', customOrderSchema);
export default customOrder;

