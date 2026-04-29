const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['master', 'superadmin', 'admin', 'employee'], required: true, default: 'employee' },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  assignedBranches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }],
  jobDescription: { type: mongoose.Schema.Types.ObjectId, ref: 'JobDescription' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  isAccountSetup: { type: Boolean, default: false },
  permissions: [{ type: String }],
  lastLogin: Date,
  deletedAt: Date,
  personalDataDeleted: { type: Boolean, default: false },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  // ✅ NEW FIELDS FOR SELF-SIGNUP & TRIAL
  emailVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationExpires: { type: Date },
  trialStartDate: { type: Date },
  trialEndDate: { type: Date },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  companyName: { type: String },
  companySize: { type: String, enum: ['1-10', '11-50', '51-200', '201-500', '500+'], default: '1-10' },
  phoneNumber: { type: String },
  signupIP: { type: String },
  signupUserAgent: { type: String },
  paymentStatus: { type: String, enum: ['trial', 'active', 'expired', 'cancelled'], default: 'trial' },
  cancelAtPeriodEnd: { type: Boolean, default: false }
}, { timestamps: true });

// Only keep the matchPassword method
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);