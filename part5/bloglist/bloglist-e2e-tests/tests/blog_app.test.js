const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith, createBlog } = require('./helper')
const { console } = require('inspector')


describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset')
    await request.post('/api/users', {
      data: {
        name: 'Matti Luukkainen',
        username: 'mluukkai',
        password: 'salainen'
      }
    })
    await page.goto('/')
  })

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'log in to application' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'username' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'password' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'login' })).toBeVisible()
    await expect(page.getByText('logged in')).not.toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'mluukkai', 'salainen')
      await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, 'mluukkai', 'wrong')
      const errorDiv = page.locator('.error')
      await expect(errorDiv).toContainText('wrong username or password')
      await expect(errorDiv).toHaveCSS('border-style', 'solid')
      await expect(errorDiv).toHaveCSS('color', 'rgb(255, 0, 0)')
      await expect(page.getByText('Matti Luukkainen logged in')).not.toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'mluukkai', 'salainen')
      await page.getByText('Matti Luukkainen logged in').waitFor()
    })

    test('a new blog can be created', async ({ page }) => {
      const title = 'Test Title'
      const author = 'Test Author'
      const url = 'test-url.com'
      await createBlog(page, title, author, url)
      expect(page.getByText(title, { exact: true })).toBeVisible()
      expect(page.getByText(author, { exact: true })).toBeVisible()
    })

    describe('and several blogs exist', () => {
      beforeEach(async ({ page }) => {
        await createBlog(page, 'Test Blog 1', 'Test Author 1', 'test-url-1.com')
        await createBlog(page, 'Test Blog 2', 'Test Author 2', 'test-url-2.com')
        await createBlog(page, 'Test Blog 3', 'Test Author 3', 'test-url-3.com')
      })

      test('one of the blogs can be liked', async ({ page }) => {
        await page.getByText('Test Blog 1 Test Author 1 show');
        await page.getByRole('button', { name: 'show' }).first().click()

        await expect(page.getByText('test-url-1.com')).toBeVisible()
        await expect(page.getByText('likes: 0')).toBeVisible()

        await page.getByRole('button', { name: 'like' }).click()
        await expect(page.getByText('likes: 1')).toBeVisible()
      })

      test('blogs arranged in order of descending likes', async ({ page, request }) => {
        const blogsFromServer = await (await request.get('/api/blogs')).json()
        const blog1obj = blogsFromServer.find(b => b.title === 'Test Blog 1')
        const blog2obj = blogsFromServer.find(b => b.title === 'Test Blog 2')
        const blog3obj = blogsFromServer.find(b => b.title === 'Test Blog 3')

        await request.put(`/api/blogs/${blog1obj.id}`, {
          data: {
            title: blog1obj.title,
            author: blog1obj.author,
            url: blog1obj.url,
            likes: 53
          }
        })
        await request.put(`/api/blogs/${blog2obj.id}`, {
          data: {
            title: blog2obj.title,
            author: blog2obj.author,
            url: blog2obj.url,
            likes: 103
          }
        })
        await request.put(`/api/blogs/${blog3obj.id}`, {
          data: {
            title: blog3obj.title,
            author: blog3obj.author,
            url: blog3obj.url,
            likes: 173
          }
        })

        await page.goto('/')

        const blog1 = await page.getByText('Test Blog 1 Test Author 1');
        await blog1.getByRole('button', { name: 'show' }).click()
        await expect(blog1.getByText('test-url-1.com')).toBeVisible()
        await expect(blog1.getByText('likes: 53')).toBeVisible()

        const blog2 = await page.getByText('Test Blog 2 Test Author 2');
        await blog2.getByRole('button', { name: 'show' }).click()
        await expect(blog2.getByText('test-url-2.com')).toBeVisible()
        await expect(blog2.getByText('likes: 103')).toBeVisible()

        const blog3 = await page.getByText('Test Blog 3 Test Author 3');
        await blog3.getByRole('button', { name: 'show' }).click()
        await expect(blog3.getByText('test-url-3.com')).toBeVisible()
        await expect(blog3.getByText('likes: 173')).toBeVisible()

        const blogs = await page.getByTestId('blog-box')

        const topBlog = await blogs.first()
        expect(topBlog.getByText('Test Blog 1 Test Author 1')).not.toBeVisible()
        expect(topBlog.getByText('Test Blog 2 Test Author 2')).not.toBeVisible()
        expect(topBlog.getByText('Test Blog 3 Test Author 3')).toBeVisible()
        expect(topBlog.getByText('likes: 53')).not.toBeVisible()
        expect(topBlog.getByText('likes: 103')).not.toBeVisible()
        expect(topBlog.getByText('likes: 173')).toBeVisible()
        
        const middleBlog = await blogs.nth(1)
        expect(middleBlog.getByText('Test Blog 1 Test Author 1')).not.toBeVisible()
        expect(middleBlog.getByText('Test Blog 2 Test Author 2')).toBeVisible()
        expect(middleBlog.getByText('Test Blog 3 Test Author 3')).not.toBeVisible()
        expect(middleBlog.getByText('likes: 53')).not.toBeVisible()
        expect(middleBlog.getByText('likes: 103')).toBeVisible()
        expect(middleBlog.getByText('likes: 173')).not.toBeVisible()

        const bottomBlog = await blogs.last()
        expect(bottomBlog.getByText('Test Blog 1 Test Author 1')).toBeVisible()
        expect(bottomBlog.getByText('Test Blog 2 Test Author 2')).not.toBeVisible()
        expect(bottomBlog.getByText('Test Blog 3 Test Author 3')).not.toBeVisible()
        expect(bottomBlog.getByText('likes: 53')).toBeVisible()
        expect(bottomBlog.getByText('likes: 103')).not.toBeVisible()
        expect(bottomBlog.getByText('likes: 173')).not.toBeVisible()
      })
    })
  })
})