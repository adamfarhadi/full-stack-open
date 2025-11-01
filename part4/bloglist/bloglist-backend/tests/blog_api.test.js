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

test('POST /api/blogs add a new blog', async () => {
  const newBlog = {
    title: 'Raphael needs a new computer',
    author: 'Raphael Raphaelsson',
    url: 'https://raphaelraphaelsson.com/blogs/raphael-needs-a-new-computer',
    likes: 1,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await test_helper.blogsInDB()
  assert.strictEqual(blogsAtEnd.length, test_helper.initialBlogs.length + 1)

  const blogTitles = blogsAtEnd.map(blog => blog.title)
  assert(blogTitles.includes(newBlog.title))
})

test('POST /api/blogs add a new blog without likes', async () => {
  const newBlog = {
    title: 'Raphael needs a new computer',
    author: 'Raphael Raphaelsson',
    url: 'https://raphaelraphaelsson.com/blogs/raphael-needs-a-new-computer',
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await test_helper.blogsInDB()
  assert.strictEqual(blogsAtEnd.length, test_helper.initialBlogs.length + 1)

  const blogTitles = blogsAtEnd.map(blog => blog.title)
  assert(blogTitles.includes(newBlog.title))

  const blogWithoutLikes = blogsAtEnd.find(blog => blog.title === newBlog.title)
  assert.strictEqual(blogWithoutLikes.likes, 0)
})

test('POST /api/blogs add a new blog without title', async () => {
  const newBlog = {
    author: 'Raphael Raphaelsson',
    url: 'https://raphaelraphaelsson.com/blogs/raphael-needs-a-new-computer',
    likes: 1,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await test_helper.blogsInDB()
  assert.strictEqual(blogsAtEnd.length, test_helper.initialBlogs.length)
})

test('POST /api/blogs add a new blog without url', async () => {
  const newBlog = {
    title: 'Raphael needs a new computer',
    author: 'Raphael Raphaelsson',
    likes: 1,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await test_helper.blogsInDB()
  assert.strictEqual(blogsAtEnd.length, test_helper.initialBlogs.length)
})

after(async () => {
  await mongoose.connection.close()
})