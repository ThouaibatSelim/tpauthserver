const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers ['authorization'];
    // Le format standard est "Bearer <token>"
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Accès refusé, token manquant" });
    }

    try {
        const verified = jwt.verify(token, process.env.APP_MASTER_KEY);
        req.user = verified; // On stocke les infos de l'utilisateur dans la requête
        next();
    } catch (err) {
        res.status(403).json({ error: "Token invalide ou expiré" });
    }
};