const request = require('supertest');
const app = require('../src/app'); // Ton application Express
const sequelize = require('../src/config/db');

// Avant les tests, on synchronise la base de données (en mémoire)
beforeAll(async () => {
  await sequelize.sync({ force: true });
});

// Après tous les tests, on ferme la connexion
afterAll(async () => {
  await sequelize.close();
});

describe('Tests d\'authentification (TP1)', () => {
  
  test('Devrait créer un utilisateur avec des données valides', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

  test('Devrait échouer si le mot de passe fait moins de 4 caractères', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'short@example.com',
        password: '123'
      });
    
    expect(response.statusCode).toBe(400); // Erreur de validation
  });

  test('Devrait échouer si l\'email est déjà utilisé', async () => {
    // On essaie d'inscrire le même email que le premier test
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'autre_password'
      });
    
    expect(response.statusCode).toBe(400);
  });
});