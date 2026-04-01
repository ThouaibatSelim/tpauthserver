const express = require('express');
const authRoutes = require('./routes/authRoutes');
const sequelize = require('./config/db');

const app = express();

// Middleware pour lire le JSON (important pour req.body)
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Export de l'application pour Supertest
module.exports = app;