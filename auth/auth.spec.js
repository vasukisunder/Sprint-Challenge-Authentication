const server = require('../api/server');
const request = require('supertest');
const db = require('../database/dbConfig');

describe('POST api/auth/', () => {
  beforeEach(async () => {
    await db('users').truncate();
  });

  it('should return 201 on register', () => {
    return request(server)
      .post('/api/auth/register')
      .send({ username: 'a', password: 'd' })
      .then(res => {
        expect(res.status).toBe(201);
      });
  });

  it('should create user', () => {
    return request(server)
      .post('/api/auth/register')
      .send({ username: 'new', password: 'new' })
      .then(res => {
        expect(res.body[0].username).toEqual("new");
      });
  });

  it('should login user', async () => {
    const user = {
      username: 'c',
      password: 'v',
    };

    await request(server)
      .post('/api/auth/register')
      .send({ username: 'c', password: 'v' })
      .then(() => {
        return request(server)
          .post('/api/auth/login')
          .send(user)
          .then(res => {
            expect(res.body.msg).toBe('Welcome c!');
          });
      });
  });

  it('should return 401 on login with invalid credentials', () => {
    return request(server)
      .post('/api/auth/login')
      .send({ username: 'a', password: 'd' })
      .then(res => {
        expect(res.status).toBe(401);
      });
  });
});