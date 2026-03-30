const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, trim: true }, // e.g., 'school-a'
    type: { 
        type: String, 
        enum: ['school', 'hospital', 'company', 'other'], 
        default: 'company' 
    },
    subscription: {
        plan: { type: String, default: 'trial' }, // trial, basic, pro
        status: { type: String, default: 'active' }, // active, paused, canceled
        startDate: { type: Date, default: Date.now },
        endDate: { type: Date },
        vatRate: { type: Number, default: 0.25 } // Example: 25%
    },
    logo: { type: String, default: '' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Organization', organizationSchema);