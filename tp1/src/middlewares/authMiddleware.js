const jwt = require('jsonwebtoken');

// On nomme la fonction pour satisfaire l'exigence "The arrow function should be named"
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    // Utilisation de l'optional chaining (?.) au lieu de &&
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Accès refusé, token manquant" });
    }

try {
        const verified = jwt.verify(token, process.env.APP_MASTER_KEY);
        req.user = verified; 
        next();
    } catch (err) {
        // 1. On log l'erreur côté serveur pour le diagnostic (répond au "Handle this exception")
        console.error("Erreur JWT :", err.message);

        // 2. On renvoie le code 403 pour tes tests Jest
        return res.status(403).json({ 
            error: "Token invalide ou expiré",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined 
        });
    }

  }

module.exports = authMiddleware;