
const express = require('express');
const router = express.Router();
const Analytics = require('../models/Analytics');
const Decision = require('../models/Decision');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, async (req, res, next) => {
  try {
    const analytics = await Analytics.findOne({ user: req.user._id });

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentDecisions = await Decision.find({
      user: req.user._id,
      createdAt: { $gte: sevenDaysAgo }
    }).select('createdAt category').lean();

    const dailyActivity = {};
    recentDecisions.forEach(d => {
      const day = d.createdAt.toISOString().split('T')[0];
      dailyActivity[day] = (dailyActivity[day] || 0) + 1;
    });

    res.json({ analytics, dailyActivity });
  } catch (err) { next(err); }
});

module.exports = router;
