import { describe, it, expect, beforeAll, afterEach, afterAll } from '@jest/globals'
import request from 'supertest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

let mongod
let app

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  process.env.MONGODB_URI = mongod.getUri()
  process.env.NODE_ENV = 'test'
  app = (await import('../index.js')).default
})

afterEach(async () => {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
})

afterAll(async () => {
  if (mongoose.connection.readyState) {
    await mongoose.connection.close()
  }
  if (mongod) {
    await mongod.stop()
  }
})

describe('Auth Routes', () => {
  describe('POST /api/v1/auth/register', () => {
    it('registers a new user successfully', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        fullname: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
      })
      expect(res.statusCode).toBe(201)
      expect(res.body.success).toBe(true)
    })

    it('rejects duplicate email with 409', async () => {
      const payload = {
        fullname: 'Dupe User',
        username: 'dupeuser',
        email: 'dupe@test.com',
        password: 'Password123!',
      }
      await request(app).post('/api/v1/auth/register').send(payload)

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ ...payload, username: 'dupeuser2' })
      expect(res.statusCode).toBe(409)
    })

    it('rejects missing required fields with 400', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'no-name@test.com' })
      expect(res.statusCode).toBe(400)
    })
  })

  describe('POST /api/v1/auth/login', () => {
    it('rejects unverified email with 403', async () => {
      await request(app).post('/api/v1/auth/register').send({
        fullname: 'Unverified User',
        username: 'unverified',
        email: 'unverified@test.com',
        password: 'Password123!',
      })
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'unverified@test.com',
        password: 'Password123!',
      })
      expect(res.statusCode).toBe(403)
    })

    it('rejects wrong password with 401', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'nobody@test.com',
        password: 'wrongpass',
      })
      expect(res.statusCode).toBe(401)
    })
  })

  describe('GET /api/v1/healthcheck', () => {
    it('returns ok status', async () => {
      const res = await request(app).get('/api/v1/healthcheck')
      expect(res.statusCode).toBe(200)
      expect(res.body.status).toBe('ok')
    })
  })
})
