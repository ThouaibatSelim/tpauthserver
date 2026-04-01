// src/models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Ta config MySQL

const User = sequelize.define('User', {
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false // DANGEREUX : Stocké en clair pour le TP1
    }
}, {
    timestamps: true // Crée automatiquement createdAt
});

module.exports = User;