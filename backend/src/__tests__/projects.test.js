import { describe, it, expect, beforeEach, beforeAll, afterAll } from '@jest/globals'
import request from 'supertest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import { User } from '../models/user.model.js'
import { ProjectMember } from '../models/projectMember.model.js'

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

const makeToken = (userId) =>
  jwt.sign({ _id: userId }, process.env.JWT_SECRET || 'test-jwt-secret-minimum-32-characters', {
    expiresIn: '15m',
  })

describe('Project Routes', () => {
  let token
  let userId

  beforeEach(async () => {
    // Create a verified user for each test
    const user = await User.create({
      fullname: 'Admin User',
      username: 'adminuser',
      email: 'admin@test.com',
      password: 'HashedPass1!',
      isEmailVerified: true,
    })
    userId = user._id
    token = makeToken(userId)
  })

  it('creates a project and adds creator as admin', async () => {
    const res = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Project', description: 'A test project' })

    expect(res.statusCode).toBe(201)
    expect(res.body.data).toBeDefined()
    expect(res.body.data.name).toBe('Test Project')

    const membership = await ProjectMember.findOne({ user: userId })
    expect(membership).not.toBeNull()
    expect(membership.role).toBe('admin')
  })

  it('lists only projects the user belongs to', async () => {
    // Create a project first
    await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'My Project', description: 'Visible project' })

    const res = await request(app)
      .get('/api/v1/projects')
      .set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toBe(200)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.length).toBeGreaterThanOrEqual(1)
  })

  it('returns 401 when no token is provided', async () => {
    const res = await request(app)
      .get('/api/v1/projects')

    expect(res.statusCode).toBe(401)
  })

  it('returns 404 for a project that does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId()
    const res = await request(app)
      .get(`/api/v1/projects/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toBe(403) // No membership → access denied
  })
})
