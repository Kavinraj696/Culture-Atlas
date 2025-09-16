const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const eventRoutes = require('./routes/events');
const cultureRoutes = require('./api/cultures');

const app = express();

// ✅ Apply CORS before any routes
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// ✅ MongoDB connection
mongoose.connect('mongodb://localhost:27017/cultureAtlas');

// ✅ Modular routes
app.use('/api/cultures', cultureRoutes);
app.use('/api/events', eventRoutes);

// ✅ Socket.IO setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:3000', methods: ['GET', 'POST'] }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('newEvent', (eventData) => {
    socket.broadcast.emit('eventUpdate', eventData);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// ✅ Start server
server.listen(4000, () => console.log('Server running on port 4000'));
