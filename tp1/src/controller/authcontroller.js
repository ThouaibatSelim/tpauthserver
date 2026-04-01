// src/controllers/authController.js

/**
 * Inscription d'un nouvel utilisateur.
 * @param {Object} req - La requête Express contenant email et password.
 * @param {Object} res - La réponse Express.
 * @returns {Promise<void>}
 */

const User = require('../models/User');

exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation simple (Exigence v1.2)
        if (!password || password.length < 4) {
            return res.status(400).json({ error: "Le mot de passe doit faire au moins 4 caractères" });
        }

        const user = await User.create({ email, password });
        res.status(201).json({ id: user.id, email: user.email });
    } catch (err) {
        res.status(400).json({ error: "Email déjà utilisé ou données invalides" });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    
    // Vérification en clair (Exigence v1.3 - DANGEREUX)
    const user = await User.findOne({ where: { email, password } });

    if (!user) {
        return res.status(401).json({ error: "Identifiants incorrects" });
    }
    res.json({ message: "Connexion réussie", user: { id: user.id, email: user.email } });
};