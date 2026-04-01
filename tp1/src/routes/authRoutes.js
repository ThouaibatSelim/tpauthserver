// routes/authRoutes.js

// Route d'inscription (v1.2-register)
router.post('/register', async (req, res, next) => {
    const { email, password } = req.body;

    // 1. Validation métier (toujours en premier)
    if (!password || password.length < 4) {
        return res.status(400).json({ error: "Le mot de passe doit faire au moins 4 caractères" });
    }

    // 2. Logique de création
    // On utilise .catch(next) pour envoyer toute erreur (DB, réseau, etc.) au handler global
    try {
        const user = await User.create({ email, password });
        res.status(201).json({ id: user.id, email: user.email });
    } catch (error) {
        // On envoie l'erreur au middleware global défini dans app.js
        next(error); 
    }
});


// Route pour récupérer ses propres infos (v1.4-protected)
// DANGEREUX : N'importe qui peut changer l'ID dans l'URL
router.get('/me/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
  
  res.json({ id: user.id, email: user.email, createdAt: user.createdAt });
});

module.exports = router;