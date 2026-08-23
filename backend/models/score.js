const mongoose = require('mongoose');
const scoreSchema = new mongoose.Schema(
{
 user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
username: { type: String, required: true },
score: { type: Number, required: true },
difficulty: { type: String, required: true, enum: ['easy', 'medium', 'hard'] }, },
{ timestamps: true }
);

module.exports = mongoose.model('Score', scoreSchema);