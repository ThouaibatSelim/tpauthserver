// src/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcrypt');
const saltRounds = 12; // Recommandé pour une sécurité industrielle

/**
 * Inscription d'un nouvel utilisateur (v2.1-bcrypt).
 * Hache le mot de passe avant stockage.
 */
exports.register = async (req, res, next) => {
    const { email, password } = req.body;

    if (!password || password.length < 4) {
        return res.status(400).json({ error: "Le mot de passe doit faire au moins 4 caractères" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // On laisse Sequelize lever une erreur si l'email existe déjà
    // On utilise .catch(next) pour envoyer l'erreur au gestionnaire global d'Express
    await User.create({ email, password: hashedPassword })
        .then(user => res.status(201).json({ id: user.id, email: user.email }))
        .catch(next); 
};

