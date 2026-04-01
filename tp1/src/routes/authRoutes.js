const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Route d'inscription (v1.2-register)
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation exigée par le TP : au moins 4 caractères
    if (!password || password.length < 4) {
      return res.status(400).json({ error: "Mot de passe trop court" });
    }

    // Création de l'utilisateur (Mot de passe stocké EN CLAIR pour le TP1)
    const user = await User.create({ email, password });
    
    res.status(201).json({ id: user.id, email: user.email });
  } catch (error) {
    // Gère l'email déjà utilisé (unique constraint)
    res.status(400).json({ error: "Email déjà utilisé" });
  }
});

// Route pour récupérer ses propres infos (v1.4-protected)
// DANGEREUX : N'importe qui peut changer l'ID dans l'URL
router.get('/me/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
  
  res.json({ id: user.id, email: user.email, createdAt: user.createdAt });
});

module.exports = router;