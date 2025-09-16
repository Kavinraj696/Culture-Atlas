const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: String,
  location: String,
  coordinates: {
    lat: Number,
    lng: Number
  },
  mediaUrl: String,
  description: String,
  tags: [String],
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', EventSchema);
