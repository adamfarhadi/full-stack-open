import { render, screen } from '@testing-library/react'
import Blog from './Blog'

test('renders content', () => {
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