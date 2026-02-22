const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  creatorId: { type: String, required: true },
  ingredients: [{
    name: String,
    amount: Number,
    unit: String
  }],
  steps: [String],
  tags: [String],
  flexibleAttributes: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { 
  timestamps: true,
  strict: false 
});

module.exports = mongoose.model('Recipe', recipeSchema);