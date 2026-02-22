const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());

const recipeRoutes = require('./routes/recipes');
app.use('/api/recipes', recipeRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB verbunden'))
  .catch((err) => console.error(err));

app.get('/', (req, res) => {
  res.send('API läuft');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server auf Port ${PORT}`);
});