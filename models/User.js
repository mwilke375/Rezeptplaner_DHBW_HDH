const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: {
    type: String,
    enum: ['koch', 'creator', 'admin'],
    default: 'koch'
  },
  favorites: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Recipe' 
  }]
}, { 
  strict: false 
});

module.exports = mongoose.model('User', userSchema);