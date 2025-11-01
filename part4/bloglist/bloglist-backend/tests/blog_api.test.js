const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const assert = require('node:assert')
const Blog = require('../models/blog')
const test_helper = require('./test_helper')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(test_helper.initialBlogs)
})

test('GET /api/blogs correct number of blogs returned', async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.length, test_helper.initialBlogs.length)
})

test('GET /api/blogs unique identifier named id', async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const allBlogsHaveId = response.body.every(blog => 'id' in blog)
  assert.ok(allBlogsHaveId, 'Not all blogs have unique identifier named id')
})

after(async () => {
  await mongoose.connection.close()
})