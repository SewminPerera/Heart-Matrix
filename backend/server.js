require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const connectDB = require('./config/db');
const User = require('./models/user');
const Score = require('./models/score');
const userRoutes = require('./routes/userRoutes');
const app = express();
const PORT = process.env.PORT || 8080;
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.get('/', (_req, res) => res.send('Heart Matrix API is running...'));
app.post('/api/users/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const avatarSeed = crypto.randomBytes(6).toString('hex');
    const user = await User.create({ username, email, password: hashedPassword, avatarSeed });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token,
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password || '');
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token,
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Google Login
app.post('/api/auth/google', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'No token provided' });

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      const dummyHash = await bcrypt.hash(email + process.env.JWT_SECRET, 10);
      const avatarSeed = crypto.randomBytes(6).toString('hex');

      user = await User.create({
        username: name || email.split('@')[0],
        email,
        password: dummyHash,
        avatarSeed,
      });
    }

    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: jwtToken,
    });
  } catch (error) {
    console.error('Google Login Error:', error);
    res.status(500).json({ message: 'Failed to authenticate with Google' });
  }
});

// public leaderboard scores
app.post('/api/scores', async (req, res) => {
try {   
const { userId, username, score, difficulty } = req.body;    
if (!userId || !username || score === undefined || !difficulty) {
return res.status(400).json({ message: 'Missing required score data.' });
}

const newScore = new Score({ user: userId, username, score, difficulty });
const saved = await newScore.save();
res.status(201).json(saved);

} catch (error) {
console.error('Error saving score:', error);
 res.status(500).json({ message: 'Server error while saving score' });
}
});

app.get('/api/scores', async (req, res) => { 
  try {
    const { difficulty } = req.query;
    const filter = {};
    if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty)) {
      filter.difficulty = difficulty;
    } else {
      filter.difficulty = 'easy';
    }
       const top = await Score.find(filter)
      .sort({ score: -1 })
      .limit(10)
      .populate('user', 'username');

res.json(top);
} catch (error) {
 console.error(' Error fetching leaderboard:', error);
 res.status(500).json({ message: 'Server error while fetching leaderboard' }); }
});

app.use('/api', userRoutes);
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err, _req, res, _next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
