const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  prepTime: { type: Number },
  ingredients: [{
    name: String,
    amount: Number,
    unit: String
  }],
  steps: [String],
  tags: [String],
  sideDishes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }]
}, { strict: false });

module.exports = mongoose.model('Recipe', recipeSchema);