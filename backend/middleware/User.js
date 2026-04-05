const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true,
        trim: true 
    },
    password: { type: String, required: true, select: false },
    role: { 
        type: String, 
        enum: ['master', 'superadmin', 'admin', 'employee'],
        default: 'employee' 
    },
    organization: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Organization',
        required: function() { return this.role !== 'master'; } // Master doesn't belong to an org
    },
    branch: { type: String, default: 'Main' }, // For multi-branch support
    jobDescription: { type: String, default: 'General' },
    isApproved: { type: Boolean, default: true }, // For employee approval flow
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match password method
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);