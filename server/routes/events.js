const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// ✅ Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);  // send events as JSON
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;
