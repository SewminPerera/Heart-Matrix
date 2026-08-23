const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String }, 
    avatarSeed: { type: String, default: '' },

    // Game stats
    totalScore: { type: Number, default: 0 },
    highScore: { type: Number, default: 0 },
    gamesPlayed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
