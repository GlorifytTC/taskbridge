const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  number: { type: String, required: true },
  name: { type: String, default: '' },
  capacity: { type: Number, default: 30 },
  type: { type: String, default: 'General' },
  building: { type: String, default: '' },
  floor: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const workerSchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  name: { type: String, required: true },
  specializations: [{ type: String }],
  type: { type: String, enum: ['regular', 'substitute'], default: 'regular' },
  shifts: [{
    dayOfWeek: { type: Number, min: 0, max: 6 }, // 0=Sunday, 1=Monday...
    startTime: { type: Number, min: 0, max: 24 },
    endTime: { type: Number, min: 0, max: 24 }
  }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const groupSchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  name: { type: String, required: true },
  peopleCount: { type: Number, default: 1 },
  requiredSkill: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  shiftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift' },
  preferredRoom: { type: String, default: '' },
  notes: { type: String, default: '' },
  isAssigned: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const shiftSchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  name: { type: String, required: true },
  startTime: { type: Number, min: 0, max: 24, required: true },
  endTime: { type: Number, min: 0, max: 24, required: true },
  daysOfWeek: [{ type: Number, min: 0, max: 6 }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const assignmentSchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  shiftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift', required: true },
  date: { type: Date, required: true },
  matchScore: { type: Number, default: 0 },
  warnings: [{ type: String }],
  status: { type: String, enum: ['pending', 'confirmed', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const learningLogSchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  originalAssignment: { type: String },
  userOverride: { type: String },
  reason: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = {
  Room: mongoose.model('Room', roomSchema),
  Worker: mongoose.model('Worker', workerSchema),
  Group: mongoose.model('Group', groupSchema),
  Shift: mongoose.model('Shift', shiftSchema),
  Assignment: mongoose.model('Assignment', assignmentSchema),
  LearningLog: mongoose.model('LearningLog', learningLogSchema)
};