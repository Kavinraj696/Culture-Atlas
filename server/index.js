const axios = require("axios");
const dotenv = require("dotenv");
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const multer = require('multer');
// Import routes
const eventRoutes = require('./routes/events');
const cultureRoutes = require('./api/cultures');

const app = express();

// ----------------------
// Middleware
// ----------------------
app.use(cors({
  origin: 'http://localhost:3000',   // Frontend URL
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json()); // Parse JSON requests

// ----------------------
// MongoDB connection
// ----------------------
mongoose.connect('mongodb://localhost:27017/cultureAtlas', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB (cultureAtlas)'))
.catch(err => console.error('MongoDB connection error:', err));


const eventSchema = new mongoose.Schema({
    festival_name: String, // Note the underscore
    country: String ,
    city: String,
    data:String, // Day of the month as string
    month: String,
    tags: [String],
    Note: String, // Description field for this schema
    note: String
  });
  // Model 1: events collection
  const Festival1 = mongoose.model('Festival1', eventSchema, 'events'); 
  
  // --- 2. Schema for the 'new_festival_submissions' collection (Saraswati Puja) ---
  const festivalSchema1 = new mongoose.Schema({
    festival_Name: String, // Note the Capital N
    country: String,
    city: String,
    date: Date, // Date object
    tags: [String],
    Note: String, // Description field for this schema
    submittedAt: { type: Date, default: Date.now }
  });
  // Model 2: new_festival_submissions collection
  const Submission1 = mongoose.model('Submission1', festivalSchema1, 'new_festival_submissions'); 
  
  // =========================================================
  // 2. NORMALIZATION FUNCTIONS (The Key Fix)
  // =========================================================
  
  // Function to normalize data from the 'events' collection
  const normalizeEvent = (doc) => ({
      // Target Frontend Keys:
      festivalName: doc.festival_name, 
      country: doc.country,
      // Date format fix: "25 Aug"
      date: `${doc.data || ''} ${doc.month || ''}`.trim(), 
      // Description fix: using 'Note' or 'note'
      description: doc.Note || doc.note || 'No description available.', 
      city: doc.city,
      tags: doc.tags,
      source: 'EventsCollection'
  });
  
  // Function to normalize data from the 'new_festival_submissions'
  const normalizeSubmission = (doc) => {
      // Format Date object to "day month" (e.g., 1 Oct)
      let formattedDate = '';
      if (doc.date && doc.date instanceof Date && !isNaN(doc.date.getTime())) {
          const options = { day: 'numeric', month: 'short' };
          const parts = new Intl.DateTimeFormat('en-US', options).format(doc.date).split(' ');
          formattedDate = `${parts[1].replace(',', '')} ${parts[0]}`; // Reorder to "day month"
      }
      let imageUrl = null;
      if (doc.image && doc.image.data) {
          const base64 = doc.image.data.toString('base64');
          imageUrl = `data:${doc.image.contentType};base64,${base64}`;
      }

      return ({
          // Target Frontend Keys:
          festivalName: doc.festival_Name, 
          country: doc.country,
          date: formattedDate, 
          // Description fix: using 'description'
          description: doc.description || doc.Note, 
          city: doc.city,
          tags: doc.tags,
          source: 'SubmissionsCollection',
          imageUrl
      });
  };
  



  
  
//start

const historySchema = new mongoose.Schema({}, { strict: false });
const History = mongoose.model('History', historySchema, 'history'); // Explicit collection name

app.get('/api/country/:country', async (req, res) => {
  try {
    const country = req.params.country;
    const doc = await History.findOne({ country: { $regex: new RegExp(`^${country}$`, 'i')} });

    if (!doc) {
      return res.json({ error: 'Country not found' });
    }
    const response = {
      name: doc?.country || 'Unknown',
      flag: doc?.flag || null,
      map:doc?.maps || null,
      locators:doc?.locators || null,
      details: {}
    };

    const keysToInclude = [
      'Introduction', 'Geography', 'Environment', 'Government',
      'Economy', 'Energy', 'Communications', 'Transportation', 'Space'
    ];

    keysToInclude.forEach(key => {
      if (doc[key]) {
        response.details[key] = doc[key];
      }
    });

    res.json(response);
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).json({ error: 'Server error' });
  }
});



//end




  // =========================================================
  // 3. API ROUTES (CORRECTED)
  // =========================================================
  
  app.get('/search', async (req, res) => {
    const query = req.query.q || ''; 
    const searchPattern = new RegExp(query, 'i'); 
  
    // Search condition must use the field names defined in the respective schemas
    // We will search for festival_name and country in both
    const searchCondition = {
        $or: [
            { festival_Name: { $regex: searchPattern } },
            { country: { $regex: searchPattern } }
        ]
    };
  
    // 🔑 Initial Load Logic (No query provided)
    if (!query) {
        try {
           const initialFestivals = await Festival1.find({}).limit(5).lean();
            const initialSubmissions = await Submission1.find({}).limit(5).lean();
      
           // 🔑 NORMALIZE AND COMBINE INITIAL RESULTS
            const initialResults = [
                ...initialFestivals.map(normalizeEvent),
                ...initialSubmissions.map(normalizeSubmission)
           ].sort(() => Math.random() - 0.5); 

           return res.status(200).json(initialResults);
        } catch (error) {
            console.error('Error during initial load:', error);
            return res.status(500).json({ message: 'Error retrieving initial data.' });
        }
   }
   
   // --- Search Logic (Query Provided) ---
    try {
        const [resultsFromFestivals, resultsFromSubmissions] = await Promise.all([
           Festival1.find(searchCondition).lean(),
           Submission1.find(searchCondition).lean()
       ]);
        // 🔑 NORMALIZE AND COMBINE SEARCH RESULTS
        const combinedResults = [
           ...resultsFromFestivals.map(normalizeEvent),
            ...resultsFromSubmissions.map(normalizeSubmission)
        ];
 
        res.status(200).json(combinedResults);
   
    } catch (error) {
        console.error('Error during search query:', error);
        res.status(500).json({ message: 'Error retrieving data from the database.' });
    }
  });


//new--
const festivalSchema = new mongoose.Schema({
  festival_Name: { type: String, required: true },
  country: { type: String, required: true },
  city: { type: String, default: '' },
  date: { type: Date, required: true },
  tags: [String],
  Note: { type: String, required: true },
  image: {
      data: Buffer,
      contentType: String
  },
  submittedAt: { type: Date, default: Date.now }
});






dotenv.config();
const PORT = process.env.PORT || 4000;
const CALENDARIFIC_KEY = process.env.CALENDARIFIC_KEY;
const PREDICTHQ_KEY = process.env.PREDICTHQ_KEY;

// --- Check Calendarific ---
async function checkCalendarific(festival, country) {
  const year = new Date().getFullYear(); // auto pick current year
  const url = `https://calendarific.com/api/v2/holidays?api_key=${CALENDARIFIC_KEY}&country=${country}&year=${year}`;
  try {
    const res = await axios.get(url);
    const holidays = res.data.response.holidays.map(h => h.name.toLowerCase());
    return holidays.includes(festival.toLowerCase());
  } catch (err) {
    console.error("Calendarific error:", err.message);
    return false;
  }
}

// --- Check PredictHQ ---
async function checkPredictHQ(festival, country) {
  const url = "https://api.predicthq.com/v1/events/";
  try {
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${PREDICTHQ_KEY}` },
      params: { q: festival, category: "festivals", country }
    });
    return res.data.results.length > 0;
  } catch (err) {
    console.error("PredictHQ error:", err.message);
    return false;
  }
}

// --- Combine both checks ---
async function verifyFestival(festival, country) {
  const [cal, phq] = await Promise.all([
    checkCalendarific(festival, country),
    checkPredictHQ(festival, country)
  ]);
  return cal || phq;
}



// --- API endpoint ---
app.get("/verify-festival", async (req, res) => {
  try {
    const { festival, country } = req.query;

    // Find matching country from the 'history' collection
    const countryDoc = await History.findOne({
      $or: [
        { country: { $regex: new RegExp(`^${country}$`, "i") } },
        { code: { $regex: new RegExp(`^${country}$`, "i") } }
      ]
    }).lean();

    if (!countryDoc) {
      return res.status(404).json(false); // ❌ Country not found
    }

    const countryCode = countryDoc.code || country.toUpperCase();

    // Verify the festival using your APIs
    const valid = await verifyFestival(festival, countryCode);

    // ✅ Return only true or false
    return res.json(valid);

  } catch (err) {
    console.error("Error in /verify-festival:", err);
    return res.status(500).json(false); // ❌ Server error = false
  }
});





const storage = multer.memoryStorage();
const upload = multer({ storage });
const Festival = mongoose.model('Festival', festivalSchema, 'new_festival_submissions');
app.post('/submit', upload.single('festivalImage'), async (req, res) => {
  try {
      const { festival_Name, country, city, date, Note, tags } = req.body;

      if (!festival_Name || !country || !date || !Note) {
          return res.status(400).json({ message: 'Missing required fields.' });
      }
      
      
      // Create festival object
      const festivalData = {
          festival_Name,
          country,
          city: city || '',
          date: new Date(date),
          tags: tags ? tags.split(',').map(t => t.trim()) : [],
          Note,
      };

      // Add image if uploaded
      if (req.file) {
          festivalData.image = {
              data: req.file.buffer,   // binary data
              contentType: req.file.mimetype
          };
      }

      const newFestival = new Festival(festivalData);
      await newFestival.save();

      res.status(201).json({ message: 'Festival saved with image!', id: newFestival._id });

  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

//--end

// ----------------------
// Routes
// ----------------------
app.use('/api/cultures', cultureRoutes);
app.use('/api/events', eventRoutes);

// ----------------------
// Socket.IO setup
// ----------------------
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('newEvent', (eventData) => {
    console.log('New event:', eventData);
    socket.broadcast.emit('eventUpdate', eventData);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// ----------------------
// Start server
// ----------------------

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
