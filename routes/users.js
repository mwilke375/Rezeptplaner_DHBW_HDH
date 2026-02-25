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

router.delete('/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: 'Nutzer nicht gefunden' });
    res.status(200).json({ message: 'Nutzer erfolgreich gelöscht' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;