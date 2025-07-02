const mongoose = require('mongoose');

const keywordsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  keywords: { type: [String], required: true },
  metadata: {
    filename: String,
    fileSize: Number,
    extractedTextLength: Number,
    summaryLength: Number
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Keywords', keywordsSchema); 
