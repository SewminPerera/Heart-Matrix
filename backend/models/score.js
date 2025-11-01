// This file defines the structure for our Score data.
const mongoose = require("mongoose");


const scoreSchema = new mongoose.Schema({
  // 'user' will be the unique ID of the player from our 'User' collection.
  // This links a score to a specific user.
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // Establishes a relationship to the User model
  },
  // We'll also store the username for easy display on the leaderboard.
  username: {
    type: String,
    required: true,
  },
  // The player's score for that game session.
  score: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true, // Automatically adds `createdAt` timestamp
});

const Score = mongoose.model('Score', scoreSchema);

module.exports = Score;