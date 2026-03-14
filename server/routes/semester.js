const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Semester = require('../models/Semester');

// GET all semesters for user
router.get('/', auth, async (req, res) => {
  try {
    const semesters = await Semester.find({ userId: req.user._id }).sort('number');
    res.json(semesters);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET one semester
router.get('/:id', auth, async (req, res) => {
  try {
    const sem = await Semester.findOne({ _id: req.params.id, userId: req.user._id });
    if (!sem) return res.status(404).json({ error: 'Semestre introuvable' });
    res.json(sem);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST create semester
router.post('/', auth, async (req, res) => {
  try {
    const sem = await Semester.create({ ...req.body, userId: req.user._id });
    res.status(201).json(sem);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT update semester
router.put('/:id', auth, async (req, res) => {
  try {
    const sem = await Semester.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!sem) return res.status(404).json({ error: 'Semestre introuvable' });
    res.json(sem);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE semester
router.delete('/:id', auth, async (req, res) => {
  try {
    await Semester.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT update subject notion
router.put('/:semId/subjects/:subjectIndex/notions', auth, async (req, res) => {
  try {
    const sem = await Semester.findOne({ _id: req.params.semId, userId: req.user._id });
    if (!sem) return res.status(404).json({ error: 'Semestre introuvable' });
    sem.subjects[req.params.subjectIndex].notions = req.body.notions;
    await sem.save();
    res.json(sem);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT update a control score
router.put('/:semId/subjects/:subjectIndex/controls/:controlIndex', auth, async (req, res) => {
  try {
    const sem = await Semester.findOne({ _id: req.params.semId, userId: req.user._id });
    if (!sem) return res.status(404).json({ error: 'Semestre introuvable' });
    sem.subjects[req.params.subjectIndex].controls[req.params.controlIndex].score = req.body.score;
    await sem.save();
    res.json(sem);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
