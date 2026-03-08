const mongoose = require('mongoose');

const shoppingListSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    name: String,
    amount: Number,
    unit: String
  }],
  createdAt: { 
    type: Date, 
    default: Date.now, 
    expires: '7d'
  }
});

module.exports = mongoose.model('ShoppingList', shoppingListSchema);