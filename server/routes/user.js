const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Semester = require('../models/Semester');

// GET /api/user/me
router.get('/me', auth, async (req, res) => {
  res.json(req.user);
});

// PUT /api/user/profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, bio, theme, language, aiPreferences, visualizerSystemPrompt } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (theme !== undefined) updates.theme = theme;
    if (language !== undefined) updates.language = language;
    if (aiPreferences !== undefined) updates.aiPreferences = { ...req.user.aiPreferences, ...aiPreferences };
    if (visualizerSystemPrompt !== undefined) updates.visualizerSystemPrompt = visualizerSystemPrompt;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/user/onboarding
router.put('/onboarding', auth, async (req, res) => {
  try {
    const { totalSemesters, currentSemester } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { totalSemesters, currentSemester, onboardingCompleted: true },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/user/progress
router.get('/progress', auth, async (req, res) => {
  try {
    const semesters = await Semester.find({ userId: req.user._id });
    const progress = {
      totalSemesters: req.user.totalSemesters,
      currentSemester: req.user.currentSemester,
      completedSemesters: semesters.filter(s => s.isCompleted).length,
      badges: req.user.badges,
      subjectStats: []
    };

    for (const sem of semesters) {
      for (const subj of sem.subjects) {
        const filledScores = subj.controls.filter(c => c.score !== null).map(c => ({ [c.variable]: c.score }));
        progress.subjectStats.push({
          semesterNumber: sem.number,
          subjectName: subj.name,
          coefficient: subj.coefficient,
          targetAverage: subj.targetAverage,
          controlsTotal: subj.controls.length,
          controlsFilled: filledScores.length
        });
      }
    }
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/user/push-subscription
router.post('/push-subscription', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { pushSubscription: req.body.subscription });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
