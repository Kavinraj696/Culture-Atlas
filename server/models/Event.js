const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  festival_name: String,
  country: String,
  city: String,
  latitude: Number,
  longitude: Number,
  date: String,
  month: String,
  note: String,
  Note: String,
  tags:Array
});

// 👇 Mongoose will map "Event" → "events" collection automatically
module.exports = mongoose.model('Event', eventSchema);
