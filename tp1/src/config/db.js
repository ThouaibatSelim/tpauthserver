// src/config/db.js
const { Sequelize } = require('sequelize');

// Configuration pour le TP : 
// On utilise SQLite en mémoire pour les tests et la CI (GitHub Actions)
// afin de garantir que la pipeline fonctionne sans dépendance externe.
const sequelize = new Sequelize('database', 'username', 'password', {
  dialect: 'sqlite',
  storage: ':memory:', // Base de données volatile qui disparaît après le test
  logging: false       // Pour ne pas polluer la console pendant les tests
});

module.exports = sequelize;