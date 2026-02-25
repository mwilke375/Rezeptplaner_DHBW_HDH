const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  unit: { type: String, required: true }
});

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  creatorId: { type: String, required: true },
  ingredients: [ingredientSchema],
  steps: [{ type: String }],
  tags: [{ type: String }],
  flexibleAttributes: { type: mongoose.Schema.Types.Mixed }
}, {
  strict: false
});

module.exports = mongoose.model('Recipe', recipeSchema);