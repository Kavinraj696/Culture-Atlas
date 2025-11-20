const express = require('express');
const router = express.Router();
const Event = require('../../models/Event');

// Get festivals/events for the current month
router.get('/', async (req, res) => {
  try {
    const currentMonthIndex = new Date().getMonth(); // 0 = Jan, 1 = Feb ...
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const currentMonth = monthNames[currentMonthIndex];

    // Fetch events of the current month
    const events = await Event.find({ month: currentMonth });
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});




module.exports = router;
