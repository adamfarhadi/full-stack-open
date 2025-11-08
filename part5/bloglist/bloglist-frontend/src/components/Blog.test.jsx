import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

test('renders title and author without toggling visibility but not url or likes', () => {
  const blog = {
    title: 'test-title',
    author: 'test-author',
    url: 'test-url.com',
    likes: 587359,
    user: {
      username: 'test-username',
      name: 'name namesson',
    }
  }

  const { container } = render(<Blog blog={blog} />)

  const blogTitleDiv = container.querySelector('#blog-title')
  const blogAuthorDiv = container.querySelector('#blog-author')
  const blogUrlLi = container.querySelector('#blog-url')
  const blogLikesLi = container.querySelector('#blog-likes')

  expect(blogTitleDiv).toHaveTextContent(blog.title)
  expect(blogAuthorDiv).toHaveTextContent(blog.author)
  expect(blogUrlLi).toBeNull()
  expect(blogLikesLi).toBeNull()
})

test('renders title, author, url, and likes after toggling visibility', async () => {
  const blog = {
    title: 'test-title',
    author: 'test-author',
    url: 'test-url.com',
    likes: 587359,
    user: {
      username: 'test-username',
      name: 'name namesson',
    }
  }

  const currentUser = {
    username: 'tester',
    name: 'Test McTester'
  }

  const { container } = render(<Blog blog={blog} currentUser={currentUser}/>)

  const user = userEvent.setup()
  const toggleVisibilityButton = container.querySelector('#toggle-visibility-button')
  await user.click(toggleVisibilityButton)

  const blogTitleDiv = container.querySelector('#blog-title')
  const blogAuthorDiv = container.querySelector('#blog-author')
  const blogUrlLi = container.querySelector('#blog-url')
  const blogLikesLi = container.querySelector('#blog-likes')

  expect(blogTitleDiv).toHaveTextContent(blog.title)
  expect(blogAuthorDiv).toHaveTextContent(blog.author)
  expect(blogUrlLi).toHaveTextContent(blog.url)
  expect(blogLikesLi).toHaveTextContent(blog.likes)
})

test('if like button clicked twice, handleLike is called twice', async () => {
  const blog = {
    title: 'test-title',
    author: 'test-author',
    url: 'test-url.com',
    likes: 587359,
    user: {
      username: 'test-username',
      name: 'name namesson',
    }
  }

  const currentUser = {
    username: 'tester',
    name: 'Test McTester'
  }

  const mockHandleLike = vi.fn()

  const { container } = render(<Blog blog={blog} currentUser={currentUser} handleLike={mockHandleLike}/>)

  const user = userEvent.setup()
  const toggleVisibilityButton = container.querySelector('#toggle-visibility-button')
  await user.click(toggleVisibilityButton)

  const likeButton = container.querySelector('#handle-like-button')
  await user.click(likeButton)
  await user.click(likeButton)

  const blogTitleDiv = container.querySelector('#blog-title')
  const blogAuthorDiv = container.querySelector('#blog-author')
  const blogUrlLi = container.querySelector('#blog-url')
  const blogLikesLi = container.querySelector('#blog-likes')

  expect(blogTitleDiv).toHaveTextContent(blog.title)
  expect(blogAuthorDiv).toHaveTextContent(blog.author)
  expect(blogUrlLi).toHaveTextContent(blog.url)
  expect(blogLikesLi).toHaveTextContent(blog.likes)

  expect(mockHandleLike.mock.calls).toHaveLength(2)
})