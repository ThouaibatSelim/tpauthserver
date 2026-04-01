require('dotenv').config(); // Charge le fichier .env
const express = require('express');
const authRoutes = require('./routes/authRoutes');
const sequelize = require('./config/db');

const app = express();

// Middleware pour lire le JSON (important pour req.body)
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// src/app.js (à mettre après toutes les routes)

app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Si c'est une erreur d'unicité de Sequelize (email déjà pris)
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({ error: "Cet email est déjà utilisé." });
  }

  // Erreur par défaut
  res.status(500).json({ error: "Une erreur interne est survenue." });
});

// Export de l'application pour Supertest
module.exports = app;