require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

const recipeRoutes = require('./routes/recipes');
app.use('/api/recipes', recipeRoutes);

const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB verbunden'))
  .catch((err) => console.error(err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server auf Port ${PORT}`);
});