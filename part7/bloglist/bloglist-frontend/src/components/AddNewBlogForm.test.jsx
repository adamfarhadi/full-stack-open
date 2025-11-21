import { render, screen } from '@testing-library/react'
import AddNewBlogForm from './AddNewBlogForm'
import userEvent from '@testing-library/user-event'

test('AddNewBlogForm calls event handler createBlog with correct details', async () => {
  const createBlog = vi.fn()
  const user = userEvent.setup()

  const { container } = render(<AddNewBlogForm createBlog={createBlog} />)

  const titleInput = screen.getByLabelText('title:')
  const authorInput = screen.getByLabelText('author:')
  const urlInput = screen.getByLabelText('url:')
  const submitButton = container.querySelector('#add-new-blog-submit-button')

  const titleInputValue = 'test-title'
  const authorInputValue = 'test-author'
  const urlInputValue = 'test-url'

  await user.type(titleInput, titleInputValue)
  await user.type(authorInput, authorInputValue)
  await user.type(urlInput, urlInputValue)
  await user.click(submitButton)

  expect(createBlog.mock.calls).toHaveLength(1)
  expect(createBlog.mock.calls[0][0]).toStrictEqual({
    title: titleInputValue,
    author: authorInputValue,
    url: urlInputValue,
  })
})
