const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const assert = require('node:assert')
const Blog = require('../models/blog')
const test_helper = require('./test_helper')

const api = supertest(app)

describe('when there are initially some blogs saved', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(test_helper.initialBlogs)
  })

  test('all blogs are returned', async () => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.length, test_helper.initialBlogs.length)
  })

  test('all blogs have a unique identifier named id', async () => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const allBlogsHaveId = response.body.every(blog => 'id' in blog)
    assert.ok(allBlogsHaveId, 'Not all blogs have unique identifier named id')
  })

  describe('adding a new blog', () => {
    test('succeeds with valid data', async () => {
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

    test('succeeds if property likes is missing', async () => {
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

    test('fails with status code 400 if title is missing', async () => {
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

    test('fails with status code 400 if url is missing', async () => {
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
  })

  describe('deleting a blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {
      const blogsAtStart = await test_helper.blogsInDB()
      const blogToDelete = blogsAtStart[0]

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)

      const blogsAtEnd = await test_helper.blogsInDB()

      const titles = blogsAtEnd.map(blog => blog.title)
      assert(!titles.includes(blogToDelete.title))

      assert.strictEqual(blogsAtEnd.length, test_helper.initialBlogs.length - 1)
    })

    test('succeeds with status code 204 if id is invalid', async () => {
      const blogsAtStart = await test_helper.blogsInDB()

      await api
        .delete('/api/blogs/5a422bc61b54a676234d17fd')
        .expect(204)

      const blogsAtEnd = await test_helper.blogsInDB()
      assert.deepStrictEqual(blogsAtEnd, blogsAtStart)
    })
  })

  describe('updating a blog', () => {
    test('succeeds with status code 200 if id is valid', async () => {
      const blogsAtStart = await test_helper.blogsInDB()
      const blogToUpdateInitialState = blogsAtStart[0]
      const blogToUpdateWithUpdatedLikes = {
        ...blogToUpdateInitialState,
        likes: blogToUpdateInitialState.likes + 1
      }

      await api
        .put(`/api/blogs/${blogToUpdateWithUpdatedLikes.id}`)
        .send(blogToUpdateWithUpdatedLikes)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await test_helper.blogsInDB()

      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)

      const updatedBlog = blogsAtEnd.find(b => b.id === blogToUpdateInitialState.id)
      assert.strictEqual(updatedBlog.likes, blogToUpdateInitialState.likes + 1)
    })

    test('fails with status code 404 if id is invalid', async () => {
      const blogsAtStart = await test_helper.blogsInDB()
      const blogToUpdateInitialState = blogsAtStart[0]
      const blogToUpdateWithUpdatedLikes = {
        ...blogToUpdateInitialState,
        likes: blogToUpdateInitialState.likes + 1,
        id: '5a422bc61b54a676234d17fd'
      }

      await api
        .put(`/api/blogs/${blogToUpdateWithUpdatedLikes.id}`)
        .send(blogToUpdateWithUpdatedLikes)
        .expect(404)

      const blogsAtEnd = await test_helper.blogsInDB()
      assert.deepStrictEqual(blogsAtEnd, blogsAtStart)
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})