const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const authMiddleware = require('../middlewares/authMiddleware');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'test' ? 10 : 5, 
    message: { error: "Trop de tentatives. Réessayez dans 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});

// Inscription
router.post('/register', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!password || password.length < 4) {
            return res.status(400).json({ error: "Mot de passe trop court" });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await User.create({ email, password: hashedPassword });
        res.status(201).json({ id: user.id, email: user.email });
    } catch (error) {
        next(error); // Envoie vers le gestionnaire d'erreurs (SequelizeUniqueConstraintError)
    }
});

// Login
router.post('/login', loginLimiter, async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Identifiants incorrects" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.APP_MASTER_KEY || 'test_key_default',
            { expiresIn: '1h' }
        );

        res.json({ message: "Connexion réussie", token, userId: user.id });
    } catch (error) {
        next(error);
    }
});

// Me
router.get('/me', authMiddleware, async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id);
        res.json({ id: user.id, email: user.email });
    } catch (error) {
        next(error);
    }
});

module.exports = router;