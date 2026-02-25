const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const User = require('../models/User');

router.post('/', async (req, res) => {
  try {
    const creatorId = req.body.creatorId;
    const user = await User.findById(creatorId);

    if (!user || user.role === 'koch') {
      return res.status(403).json({ message: 'Zugriff verweigert: Nur Creator oder Admins dürfen Rezepte erstellen.' });
    }

    const newRecipe = new Recipe(req.body);
    const savedRecipe = await newRecipe.save();
    res.status(201).json(savedRecipe);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const query = {};
    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: 'i' };
    }
    const recipes = await Recipe.find(query);
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(403).json({ message: 'Benutzer nicht gefunden.' });
    }

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Rezept nicht gefunden.' });
    }

    if (user.role === 'admin' || recipe.creatorId === userId) {
      await Recipe.findByIdAndDelete(req.params.id);
      return res.status(200).json({ message: 'Rezept erfolgreich gelöscht.' });
    } else {
      return res.status(403).json({ message: 'Zugriff verweigert: Nur der Ersteller oder ein Admin darf dieses Rezept löschen.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;