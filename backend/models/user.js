// This file defines the "schema" or structure for our User data.
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Define the fields for a user.
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // No two users can have the same email.
  },
  password: {
    type: String,
    required: true,
  },
}, {
  // `timestamps: true` automatically adds `createdAt` and `updatedAt` fields.
  timestamps: true,
});

// Create the 'User' model from the schema.
const User = mongoose.model('User', userSchema);

module.exports = User;