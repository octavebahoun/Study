// routes/notification.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const webpush = require('web-push');
const User = require('../models/User');

webpush.setVapidDetails(
  process.env.VAPID_EMAIL || 'mailto:admin@studynotes.app',
  process.env.VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

router.get('/vapid-key', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

router.post('/send-test', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.pushSubscription) return res.status(400).json({ error: 'Pas de subscription push' });

    await webpush.sendNotification(
      user.pushSubscription,
      JSON.stringify({ title: 'StudyNotes', body: 'Notifications activées ! ✅', icon: '/icon-192.png' })
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
