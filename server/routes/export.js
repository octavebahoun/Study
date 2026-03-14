const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Semester = require('../models/Semester');

// GET /api/export/semester/:id — export JSON for PDF generation on frontend
router.get('/semester/:id', auth, async (req, res) => {
  try {
    const sem = await Semester.findOne({ _id: req.params.id, userId: req.user._id });
    if (!sem) return res.status(404).json({ error: 'Semestre introuvable' });
    res.json({ semester: sem, user: req.user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
