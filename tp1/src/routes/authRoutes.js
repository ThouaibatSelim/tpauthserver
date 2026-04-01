// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt'); // Import de bcrypt
const saltRounds = 12; // Exigence TP2
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/authMiddleware');

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

// --- LOGIN MIS À JOUR (v3.1) ---
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Identifiants incorrects" });
        }

        // Génération du Token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.APP_MASTER_KEY,
            { expiresIn: '1h' }
        );

        // On renvoie le token ET le userId pour que tes anciens tests passent aussi
        res.json({ 
            message: "Connexion réussie", 
            token: token,
            userId: user.id 
        });
    } catch (error) {
        next(error);
    }
});

// --- ROUTE /ME PROTÉGÉE (v3.3) ---
router.get('/me', authMiddleware, async (req, res, next) => {
    try {
        // req.user est rempli par le middleware
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

        res.json({
            id: user.id,
            email: user.email,
            createdAt: user.createdAt
        });
    } catch (error) {
        next(error);
    }
});

// Garde ta route register telle quelle...
module.exports = router;