process.env.APP_MASTER_KEY = 'test_master_key_for_ci_only';

const request = require('supertest');
const app = require('../src/app'); // Ton application Express
const sequelize = require('../src/config/db');
const User = require('../src/models/User');

jest.setTimeout(30000); 

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

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

test('Le mot de passe stocké doit être haché (Format bcrypt)', async () => {
  const email = 'hacker@test.com';
  const password = 'mon_password_secret';

  await request(app)
    .post('/api/auth/register')
    .send({ email, password });

  // On va chercher l'utilisateur directement en base pour voir son mot de passe
  const user = await User.findOne({ where: { email } });

  // 1. Le mot de passe en base ne doit PAS être "mon_password_secret"
  expect(user.password).not.toBe(password);
  
  // 2. Le mot de passe doit commencer par le préfixe bcrypt $2b$ (ou $2a$)
  expect(user.password).toMatch(/^\$2[ayb]\$.+/);
});

test('Le mot de passe en base doit être haché', async () => {
    await request(app).post('/api/auth/register').send({
        email: 'hash@test.com',
        password: 'mon_password'
    });

    const user = await User.findOne({ where: { email: 'hash@test.com' } });
    expect(user.password).not.toBe('mon_password'); // On vérifie que c'est haché
    expect(user.password).toContain('$2b$12$'); // Format standard bcrypt
});

test('Login : Devrait réussir avec les bons identifiants', async () => {
    // 1. On crée l'utilisateur
    await request(app).post('/api/auth/register').send({
        email: 'login-success@test.com',
        password: 'password123'
    });

    // 2. On tente de se connecter
    const response = await request(app).post('/api/auth/login').send({
        email: 'login-success@test.com',
        password: 'password123'
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('userId');
});

test('Login : Devrait échouer avec un mauvais mot de passe', async () => {
    const response = await request(app).post('/api/auth/login').send({
        email: 'login-success@test.com',
        password: 'mauvais-password'
    });

    expect(response.statusCode).toBe(401);
});

test('Login : Devrait échouer si l\'email n\'existe pas', async () => {
    const response = await request(app).post('/api/auth/login').send({
        email: 'inexistant@test.com',
        password: 'password123'
    });

    expect(response.statusCode).toBe(401);
});

test('JWT : Le login doit renvoyer un token valide', async () => {
    const response = await request(app).post('/api/auth/login').send({
        email: 'login-success@test.com',
        password: 'password123'
    });

    expect(response.body).toHaveProperty('token');
    // Un JWT possède toujours deux points (3 parties)
    expect(response.body.token.split('.').length).toBe(3);
});

test('Protection : /me doit être inaccessible sans token', async () => {
    const response = await request(app).get('/api/auth/me');
    expect(response.statusCode).toBe(401); // Refusé
});

test('Protection : /me doit fonctionner avec un token valide', async () => {
    // 1. On récupère le token
    const loginRes = await request(app).post('/api/auth/login').send({
        email: 'login-success@test.com',
        password: 'password123'
    });
    const token = loginRes.body.token;

    // 2. On l'utilise dans le header Authorization
    const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.email).toBe('login-success@test.com');
});

test('TP4 : Devrait bloquer après trop de tentatives (Rate Limit)', async () => {
    // On simule 11 tentatives de login
    for (let i = 0; i < 11; i++) {
        const response = await request(app).post('/api/auth/login').send({
            email: 'test@test.com',
            password: 'mauvais-password'
        });
        
        if (i === 10) {
            // La 11ème doit être bloquée
            expect(response.statusCode).toBe(429); 
            expect(response.body.error).toContain("Trop de tentatives");
        }
    }
});

// TP5

describe('Changement de mot de passe (TP5)', () => {
    let token;

beforeAll(async () => {
        // 1. On crée l'utilisateur (on ignore si il existe déjà avec un catch vide)
        await request(app).post('/api/auth/register').send({ 
            email: 'test-nouveau-final@test.com', 
            password: 'OldPassword123!' 
        }).catch(() => {});

        // 2. On se connecte
        const loginRes = await request(app).post('/api/auth/login').send({ 
            email: 'test-nouveau-final@test.com', 
            password: 'OldPassword123!' 
        });

        // 3. VERIFICATION CRITIQUE
        token = loginRes.body.token;
        
        if (!token) {
            console.error("ERREUR : Le login n'a pas renvoyé de token !", loginRes.body);
        }
    });

    test('Succès : Changement de mot de passe valide', async () => {
        const res = await request(app)
            .put('/api/auth/change-password')
            .set('Authorization', `Bearer ${token}`)
            .send({
                email: 'test-nouveau-final@test.com',
                oldPassword: 'OldPassword123!',
                newPassword: 'NewSecurePassword2026!',
                confirmPassword: 'NewSecurePassword2026!'
            });
        expect(res.statusCode).toBe(200);
    });

    test('Échec : Ancien mot de passe incorrect', async () => {
        const res = await request(app)
            .put('/api/auth/change-password')
            .set('Authorization', `Bearer ${token}`)
            .send({
                email: 'test-nouveau-final@test.com',
                oldPassword: 'MauvaisPassword999!',
                newPassword: 'NewSecurePassword2026!',
                confirmPassword: 'NewSecurePassword2026!'
            });
        expect(res.statusCode).toBe(401);
    });

    test('Échec : Confirmation différente', async () => {
        const res = await request(app)
            .put('/api/auth/change-password')
            .set('Authorization', `Bearer ${token}`)
            .send({
                email: 'test-nouveau-final@test.com',
                oldPassword: 'OldPassword123!',
                newPassword: 'NewSecurePassword2026!',
                confirmPassword: 'PasswordDifferent123!'
            });
        expect(res.statusCode).toBe(400);
    });
});