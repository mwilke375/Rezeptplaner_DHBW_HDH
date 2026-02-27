const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const User = require('../models/User');

router.post('/', async (req, res) => {
  try {
    const creatorId = req.body.creatorId;
    
    if (!creatorId) {
      return res.status(400).json({ message: 'Fehlende creatorId im Body.' });
    }

    const user = await User.findById(creatorId);

    if (!user || user.role === 'koch') {
      return res.status(403).json({ message: 'Zugriff verweigert: Nur Creator oder Admins dürfen Rezepte erstellen.' });
    }

    const newRecipe = new Recipe(req.body);
    const savedRecipe = await newRecipe.save();
    res.status(201).json(savedRecipe);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Ungültiges ID-Format.' });
    }
    res.status(400).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const query = {};
    
    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: 'i' };
    }

    if (req.query.tags) {
      const tagsArray = req.query.tags.split(',').map(tag => new RegExp('^' + tag.trim() + '$', 'i'));
      query.tags = { $in: tagsArray };
    }

    if (req.query.exclude) {
      const excludeArray = req.query.exclude.split(',').map(item => new RegExp(item.trim(), 'i'));
      query['ingredients.name'] = { $nin: excludeArray };
    }

    if (req.query.sort === 'zeit') {
      query.prepTime = { $exists: true, $ne: null };
    }

    let mongooseQuery = Recipe.find(query);

    if (req.query.sort === 'zeit') {
      mongooseQuery = mongooseQuery.sort({ prepTime: 1 });
    }

    const recipes = await mongooseQuery;
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate('sideDishes').lean();
    
    if (!recipe) {
      return res.status(404).json({ message: 'Rezept nicht gefunden.' });
    }

    const originalPortions = recipe.portions || 1;
    const targetPortions = req.query.portions ? parseFloat(req.query.portions) : originalPortions;

    if (targetPortions !== originalPortions && targetPortions > 0) {
      const factor = targetPortions / originalPortions;
      
      if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
        recipe.ingredients = recipe.ingredients.map(ing => {
          if (ing.amount) {
            ing.amount = ing.amount * factor;
          }
          return ing;
        });
      }
      recipe.portions = targetPortions;
    }

    res.status(200).json(recipe);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Ungültiges ID-Format.' });
    }
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const userId = req.body.userId;
    
    if (!userId) {
      return res.status(400).json({ message: 'Fehlende userId im Body.' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(403).json({ message: 'Benutzer nicht gefunden.' });
    }

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Rezept nicht gefunden.' });
    }

    if (user.role === 'admin' || recipe.creatorId.toString() === userId) {
      const updateData = { ...req.body };
      delete updateData.userId;

      const updatedRecipe = await Recipe.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );
      
      return res.status(200).json(updatedRecipe);
    } else {
      return res.status(403).json({ message: 'Zugriff verweigert: Nur der Ersteller oder ein Admin darf dieses Rezept bearbeiten.' });
    }
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Ungültiges ID-Format.' });
    }
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const userId = req.body.userId;

    if (!userId) {
      return res.status(400).json({ message: 'Fehlende userId im Body.' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(403).json({ message: 'Benutzer nicht gefunden.' });
    }

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Rezept nicht gefunden.' });
    }

    if (user.role === 'admin' || recipe.creatorId.toString() === userId) {
      await Recipe.findByIdAndDelete(req.params.id);
      return res.status(200).json({ message: 'Rezept erfolgreich gelöscht.' });
    } else {
      return res.status(403).json({ message: 'Zugriff verweigert: Nur der Ersteller oder ein Admin darf dieses Rezept löschen.' });
    }
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Ungültiges ID-Format.' });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;