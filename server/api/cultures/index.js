const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const culturalData = [
  {
    "name": "Diwali",
    "place": "Varanasi, India",
    "country": "India",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "category": "Festival",
    "description": "Festival of lights celebrated across India.",
    "mediaUrl": "https://yourcdn.com/diwali.jpg",
    "tags": ["celebration", "religion", "light"],
    "date": "2025-11-12"
  },
  {
    "name": "Carnival of Barranquilla",
    "place": "Barranquilla, Colombia",
    "country": "Colombia",
    "latitude": 10.9639,
    "longitude": -74.7964,
    "category": "Festival",
    "description": "A vibrant celebration of music, dance, and folklore.",
    "mediaUrl": "https://yourcdn.com/barranquilla.jpg"
  }
 ]

  res.json(culturalData);
});

module.exports = router;