// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt'); // Import de bcrypt
const saltRounds = 12; // Exigence TP2

router.post('/register', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validation longueur (v1.2)
        if (!password || password.length < 4) {
            return res.status(400).json({ error: "Mot de passe trop court" });
        }

        // HACHAGE (v2.1-bcrypt)
        // C'est cette ligne qui va faire passer tes tests !
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = await User.create({ 
            email, 
            password: hashedPassword // On enregistre le hash, pas le clair
        });
        
        res.status(201).json({ id: user.id, email: user.email });
    } catch (error) {
        next(error); 
    }
});

router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ error: "Identifiants incorrects" });
        }

        // Comparaison du hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Identifiants incorrects" });
        }

        res.json({ message: "Connexion réussie", userId: user.id });
    } catch (error) {
        next(error);
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