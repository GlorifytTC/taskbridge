const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  peopleCount: { type: Number, required: true, default: 1 },
  requiredSkill: { type: String },
  priority: { type: String, enum: ['Urgent', 'High', 'Normal', 'Low'], default: 'Normal' },
  shiftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift' },
  preferredRoomType: { type: String },
  notes: { type: String },
  status: { type: String, enum: ['pending', 'assigned', 'completed'], default: 'pending' },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Group', groupSchema);