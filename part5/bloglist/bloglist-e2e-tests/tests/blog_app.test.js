const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith, createBlog } = require('./helper')


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
    })
  })
})