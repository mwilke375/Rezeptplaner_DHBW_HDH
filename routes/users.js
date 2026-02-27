const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/register', async (req, res) => {
  try {
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username: username });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Falscher Name oder Passwort' });
    }

    res.status(200).json({ message: 'Erfolgreich eingeloggt', user: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/favorites', async (req, res) => {
  try {
    const { userId, recipeId } = req.body;

    if (!userId || !recipeId) {
      return res.status(400).json({ message: 'userId und recipeId werden benötigt.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden.' });
    }

    if (!user.favorites.includes(recipeId)) {
      user.favorites.push(recipeId);
      await user.save();
      return res.status(200).json({ message: 'Rezept zu Favoriten hinzugefügt.', favorites: user.favorites });
    } else {
      return res.status(200).json({ message: 'Rezept ist bereits in den Favoriten.', favorites: user.favorites });
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
    const adminId = req.body.adminId;
    const adminUser = await User.findById(adminId);

    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ message: 'Zugriff verweigert: Nur Admins dürfen Nutzer löschen.' });
    }

    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: 'Nutzer nicht gefunden' });
    
    res.status(200).json({ message: 'Nutzer erfolgreich vom Admin gelöscht' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;