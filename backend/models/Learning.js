const mongoose = require('mongoose');

const learningSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  skill: {
    type: String,
    required: true
  },
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker'
  },
  roomType: {
    type: String
  },
  groupType: {
    type: String
  },
  successCount: {
    type: Number,
    default: 0
  },
  overrideCount: {
    type: Number,
    default: 0
  },
  lastUsed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Learning', learningSchema);