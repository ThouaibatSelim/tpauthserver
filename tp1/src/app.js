require('dotenv').config();
const express = require('express');
const helmet = require('helmet'); // TP4
const authRoutes = require('./routes/authRoutes'); // Vérifie bien le chemin ici !

const app = express();

app.use(helmet()); 
app.use(express.json());

// C'est cette ligne qui branche tes routes sur le préfixe utilisé par tes tests
app.use('/api/auth', authRoutes); 

// Gestionnaire d'erreurs (doit être APRES les routes)
app.use((err, req, res, next) => {
    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ error: "Email déjà utilisé" });
    }

    // Log de l'erreur réelle dans la console pour débugger
    console.error("ERREUR SERVEUR :", err);
    
    res.status(500).json({ error: "Erreur serveur" });
});

module.exports = app;