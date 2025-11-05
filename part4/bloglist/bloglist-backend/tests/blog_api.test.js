const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const assert = require('node:assert')
const Blog = require('../models/blog')
const User = require('../models/user')
const test_helper = require('./test_helper')
const bcrypt = require('bcrypt')

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
    var authorizationString = null

    beforeEach(async () => {
      await User.deleteMany({})
      const passwordHash = await bcrypt.hash('test', 10)
      const user = new User({ username: 'test', name: 'test', passwordHash: passwordHash })
      await user.save()

      const loginResponse = await api
        .post('/api/login')
        .send({ username: user.username, password: 'test' })

      const token = loginResponse.body.token
      authorizationString = 'Bearer '.concat(token)
    })

    test('succeeds with valid data and valid token provided', async () => {
      const newBlog = {
        title: 'Raphael needs a new computer',
        author: 'Raphael Raphaelsson',
        url: 'https://raphaelraphaelsson.com/blogs/raphael-needs-a-new-computer',
        likes: 1,
      }

      await api
        .post('/api/blogs')
        .set('Authorization', authorizationString)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await test_helper.blogsInDB()
      assert.strictEqual(blogsAtEnd.length, test_helper.initialBlogs.length + 1)

      const blogTitles = blogsAtEnd.map(blog => blog.title)
      assert(blogTitles.includes(newBlog.title))
    })

    test('succeeds if property likes is missing and valid token provided', async () => {
      const newBlog = {
        title: 'Raphael needs a new computer',
        author: 'Raphael Raphaelsson',
        url: 'https://raphaelraphaelsson.com/blogs/raphael-needs-a-new-computer',
      }

      await api
        .post('/api/blogs')
        .set('Authorization', authorizationString)
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

    test('fails with status code 400 if title is missing and valid token provided', async () => {
      const newBlog = {
        author: 'Raphael Raphaelsson',
        url: 'https://raphaelraphaelsson.com/blogs/raphael-needs-a-new-computer',
        likes: 1,
      }

      await api
        .post('/api/blogs')
        .set('Authorization', authorizationString)
        .send(newBlog)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await test_helper.blogsInDB()
      assert.strictEqual(blogsAtEnd.length, test_helper.initialBlogs.length)
    })

    test('fails with status code 400 if url is missing and valid token provided', async () => {
      const newBlog = {
        title: 'Raphael needs a new computer',
        author: 'Raphael Raphaelsson',
        likes: 1,
      }

      await api
        .post('/api/blogs')
        .set('Authorization', authorizationString)
        .send(newBlog)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await test_helper.blogsInDB()
      assert.strictEqual(blogsAtEnd.length, test_helper.initialBlogs.length)
    })

    test('fails with status code 401 if valid token not provided', async () => {
      const newBlog = {
        title: 'Raphael needs a new computer',
        author: 'Raphael Raphaelsson',
        url: 'https://raphaelraphaelsson.com/blogs/raphael-needs-a-new-computer',
        likes: 1,
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await test_helper.blogsInDB()
      assert.strictEqual(blogsAtEnd.length, test_helper.initialBlogs.length)
    })
  })

  describe('deleting a blog', () => {
    var authorizationString = null

    beforeEach(async () => {
      await User.deleteMany({})
      const passwordHash = await bcrypt.hash('test', 10)
      const user = new User({ username: 'test', name: 'test', passwordHash: passwordHash })
      await user.save()

      const loginResponse = await api
        .post('/api/login')
        .send({ username: user.username, password: 'test' })

      const token = loginResponse.body.token
      authorizationString = 'Bearer '.concat(token)
    })

    test('succeeds with status code 204 if id is valid and valid token provided', async () => {
      const newBlog = {
        title: 'Raphael needs a new computer',
        author: 'Raphael Raphaelsson',
        url: 'https://raphaelraphaelsson.com/blogs/raphael-needs-a-new-computer',
        likes: 1,
      }

      await api
        .post('/api/blogs')
        .set('Authorization', authorizationString)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtStart = await test_helper.blogsInDB()
      const blogToDelete = blogsAtStart.find(b => b.title === 'Raphael needs a new computer')

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', authorizationString)
        .expect(204)

      const blogsAtEnd = await test_helper.blogsInDB()

      const titles = blogsAtEnd.map(blog => blog.title)
      assert(!titles.includes(blogToDelete.title))

      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)
    })

    test('succeeds with status code 204 if id is invalid and valid token is provided', async () => {
      const blogsAtStart = await test_helper.blogsInDB()

      await api
        .delete('/api/blogs/5a422bc61b54a676234d17fd')
        .set('Authorization', authorizationString)
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

describe('when there is initially one user saved', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const passwordHash = await bcrypt.hash('test', 10)
    const user = new User({ username: 'test', name: 'test', passwordHash: passwordHash })
    await user.save()
  })

  test('creation succeeds with a valid username', async () => {
    const usersAtStart = await test_helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await test_helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })

  test('creation fails with status code 400 if username is duplicate', async () => {
    const usersAtStart = await test_helper.usersInDb()

    const newUser = {
      username: 'test',
      name: 'test',
      password: 'test',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await test_helper.usersInDb()
    assert(result.body.error.includes('expected `username` to be unique'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('creation fails with status code 400 if username not given', async () => {
    const usersAtStart = await test_helper.usersInDb()

    const newUser = {
      name: 'test',
      password: 'test',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await test_helper.usersInDb()
    assert(result.body.error.includes('Path `username` is required'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('creation fails with status code 400 if password not given', async () => {
    const usersAtStart = await test_helper.usersInDb()

    const newUser = {
      username: 'test',
      name: 'test'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await test_helper.usersInDb()
    assert(result.body.error.includes('password must be provided'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('creation fails with status code 400 if password is less than 3 characters long', async () => {
    const usersAtStart = await test_helper.usersInDb()

    const newUser = {
      username: 'test',
      name: 'test',
      password: 'te',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await test_helper.usersInDb()
    assert(result.body.error.includes('password must be at least 3 characters long'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('creation fails with status code 400 if username is less than 3 characters long', async () => {
    const usersAtStart = await test_helper.usersInDb()

    const newUser = {
      username: 'te',
      name: 'test',
      password: 'test',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await test_helper.usersInDb()
    assert(result.body.error.includes('Path `username` (`te`, length 2) is shorter than the minimum allowed length (3)'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
})

after(async () => {
  await mongoose.connection.close()
})