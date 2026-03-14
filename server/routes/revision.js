// routes/revision.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Revision = require('../models/Revision');

// Save a revision result
router.post('/', auth, async (req, res) => {
  try {
    const revision = await Revision.create({ ...req.body, userId: req.user._id });
    res.status(201).json(revision);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get revisions for a subject
router.get('/:semesterId/:subjectName', auth, async (req, res) => {
  try {
    const revisions = await Revision.find({
      userId: req.user._id,
      semesterId: req.params.semesterId,
      subjectName: decodeURIComponent(req.params.subjectName)
    }).sort('-createdAt');
    res.json(revisions);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
