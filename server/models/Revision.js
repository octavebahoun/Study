const mongoose = require('mongoose');

const revisionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  semesterId: { type: mongoose.Schema.Types.ObjectId, required: true },
  subjectName: { type: String, required: true },
  type: {
    type: String,
    enum: ['flashcards', 'quiz', 'summary', 'podcast', 'roadmap', 'visualizer', 'rag'],
    required: true
  },
  content: { type: mongoose.Schema.Types.Mixed },
  model: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now, expires: '30d' }
});

module.exports = mongoose.model('Revision', revisionSchema);
