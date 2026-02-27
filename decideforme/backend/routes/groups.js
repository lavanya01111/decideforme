
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const GroupVote = require('../models/GroupVote');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { title, category, options, expiresAt } = req.body;
    const shareToken = crypto.randomBytes(16).toString('hex');

    const group = await GroupVote.create({
      creator: req.user._id,
      title,
      category,
      options: options.map(text => ({ text, votes: [], voteCount: 0 })),
      shareToken,
      expiresAt: expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000) 
    });

    const shareUrl = `${process.env.CLIENT_URL}/vote/${shareToken}`;
    res.status(201).json({ group, shareUrl });
  } catch (err) { next(err); }
});

router.get('/token/:token', async (req, res, next) => {
  try {
    const group = await GroupVote.findOne({ shareToken: req.params.token })
      .populate('creator', 'name');
    if (!group) return res.status(404).json({ error: 'Vote not found.' });
    res.json({ group });
  } catch (err) { next(err); }
});

router.post('/token/:token/vote', async (req, res, next) => {
  try {
    const { optionText, voterName } = req.body;
    const group = await GroupVote.findOne({ shareToken: req.params.token });

    if (!group || group.status !== 'open') {
      return res.status(400).json({ error: 'Voting is closed.' });
    }

    const option = group.options.find(o => o.text === optionText);
    if (!option) return res.status(400).json({ error: 'Invalid option.' });

    option.voteCount += 1;
    await group.save();

    res.json({ message: 'Vote cast!', group });
  } catch (err) { next(err); }
});

router.put('/:id/close', authenticate, async (req, res, next) => {
  try {
    const group = await GroupVote.findOne({ _id: req.params.id, creator: req.user._id });
    if (!group) return res.status(404).json({ error: 'Group not found.' });

    const winner = group.options.sort((a, b) => b.voteCount - a.voteCount)[0];
    group.winner = winner.text;
    group.status = 'decided';
    await group.save();

    res.json({ message: 'Voting closed!', winner: winner.text, group });
  } catch (err) { next(err); }
});

module.exports = router;
