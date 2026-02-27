
const express = require('express');
const router = express.Router();
const Preference = require('../models/Preference');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, async (req, res, next) => {
  try {
    const prefs = await Preference.findOne({ user: req.user._id });
    res.json({ preferences: prefs });
  } catch (err) { next(err); }
});

router.put('/', authenticate, async (req, res, next) => {
  try {
    const prefs = await Preference.findOneAndUpdate(
      { user: req.user._id },
      { $set: req.body },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ message: 'Preferences updated!', preferences: prefs });
  } catch (err) { next(err); }
});

module.exports = router;
