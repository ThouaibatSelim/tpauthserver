// Dans ton controller login :
const user = await User.findOne({ where: { email } });
if (user) {
  const match = await bcrypt.compare(password, user.password);
  if (match) {
    // Connexion réussie
  }
}