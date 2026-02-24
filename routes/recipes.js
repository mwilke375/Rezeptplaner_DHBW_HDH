const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');

// US01 & US03: Rezept erstellen
router.post('/', async (req, res) => {
  try {
    const newRecipe = new Recipe(req.body);
    const savedRecipe = await newRecipe.save();
    res.status(201).json(savedRecipe);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// US09: Rezepte abrufen & Suchen
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

// US04: Rezept löschen
router.delete('/:id', async (req, res) => {
  try {
    const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!deletedRecipe) return res.status(404).json({ message: 'Nicht gefunden' });
    res.status(200).json({ message: 'Rezept erfolgreich gelöscht' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;