const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Accès refusé" });
  }

  try {
    // Utilise une valeur par défaut si APP_MASTER_KEY n'est pas chargée en test
    const secret = process.env.APP_MASTER_KEY || 'test_key_default';
    const verified = jwt.verify(token, secret);
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ error: "Token invalide" });
  }
};