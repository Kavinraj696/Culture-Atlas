const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
app.use(cors());

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const dbName = 'cultureAtlas';

app.get('/api/cultures', async (req, res) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const cultures = await db.collection('cultures').find().toArray();
    res.json(cultures);
  } catch (err) {
    console.error('❌ Error fetching cultures:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
