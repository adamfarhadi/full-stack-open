import { Routes, Link } from 'react-router-dom'

const BlogCard = ({ blog }) => {
  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5,
  }

  return (
    <div style={blogStyle}>
      <div style={{ display: 'inline' }}>
        <Link to={`/blogs/${blog.id}`}>
          <em>{blog.title}</em>
          {' by '}
          {blog.author}
        </Link>
      </div>
    </div>
  )
}

export default BlogCard
