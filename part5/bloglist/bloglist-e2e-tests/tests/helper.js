const loginWith = async (page, username, password) => {
  await page.getByLabel('username').fill(username)
  await page.getByLabel('password').fill(password)
  await page.getByRole('button', { name: 'login' }).click()
}

const createBlog = async (page, title, author, url) => {
  await page.getByRole('button', { name: 'create new blog' }).click()
  await page.getByRole('textbox', { name: 'title:' }).fill(title);
  await page.getByRole('textbox', { name: 'author:' }).click();
  await page.getByRole('textbox', { name: 'author:' }).fill(author);
  await page.getByRole('textbox', { name: 'url:' }).click();
  await page.getByRole('textbox', { name: 'url:' }).fill(url);
  await page.getByRole('button', { name: 'create' }).click()
  await page.getByText(title, { exact: true }).waitFor()
  await page.getByText(author, { exact: true }).waitFor()
}

export { loginWith, createBlog }