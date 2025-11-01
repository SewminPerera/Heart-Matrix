// ***** THIS MUST BE THE VERY FIRST LINE *****
require('dotenv').config();

// --- Dependencies ---
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db.js');
const User = require('./models/user.js');
const Score = require('./models/score.js');

// --- Connect to Database ---
connectDB();

// --- App Setup ---
const app = express();
const PORT = process.env.PORT || 8080;
app.use(cors());
app.use(express.json());

// --- Root Route ---
app.get('/', (req, res) => {
  res.send('❤️ Heart Matrix API is running...');
});

// --- User Registration Route ---
app.post('/api/users/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({ username, email, password: hashedPassword });

    // Return token and user info
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' }),
    });
  } catch (error) {
    console.error('❌ Registration Error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// --- User Login Route ---
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    // Successful login → send token
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' }),
    });
  } catch (error) {
    console.error('❌ Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// --- POST /api/scores (submit a new score) ---
app.post('/api/scores', async (req, res) => {
  try {
    const { userId, username, score } = req.body;

    if (!userId || !username || score === undefined) {
      return res.status(400).json({ message: 'Missing required score data.' });
    }

    const newScore = new Score({ user: userId, username, score });
    const savedScore = await newScore.save();

    res.status(201).json(savedScore);
  } catch (error) {
    console.error('❌ Error saving score:', error);
    res.status(500).json({ message: 'Server error while saving score' });
  }
});

// --- GET /api/scores (fetch leaderboard) ---
app.get('/api/scores', async (req, res) => {
  try {
    const topScores = await Score.find({})
      .sort({ score: -1 })
      .limit(10)
      .populate('user', 'username');

    res.json(topScores);
  } catch (error) {
    console.error('❌ Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Server error while fetching leaderboard' });
  }
});

// --- Error Handling Middleware ---
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('🔥 Unhandled Error:', err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// --- Server Startup ---
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
