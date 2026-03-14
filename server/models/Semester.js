const mongoose = require('mongoose');

const controlSchema = new mongoose.Schema({
  name: { type: String, required: true },
  variable: { type: String, required: true }, // i1, i2, d1...
  date: { type: Date },
  score: { type: Number, min: 0, max: 20, default: null }
});

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  coefficient: { type: Number, default: 1 },
  formula: { type: String, required: true }, // ex: (i1+i2)*0.4 + (0.6*d1)
  controls: [controlSchema],
  notions: [{ type: String }],
  documents: [{
    name: { type: String },
    path: { type: String },
    type: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  targetAverage: { type: Number, default: 10 }
});

const semesterSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  number: { type: Number, required: true },
  name: { type: String, default: '' },
  targetAverage: { type: Number, default: 12 },
  subjects: [subjectSchema],
  isCompleted: { type: Boolean, default: false },
  globalBilanGenerated: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Semester', semesterSchema);
