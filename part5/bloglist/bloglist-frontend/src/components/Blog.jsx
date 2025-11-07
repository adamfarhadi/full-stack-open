import { useState } from 'react'

const Blog = ({ blog, handleLike, currentUser, handleRemove }) => {
  const [visible, setVisible] = useState(false)

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  const showDeleteButton = () => {
    if (currentUser.username === blog.user.username)
      return (
        <>
          <button onClick={() => handleRemove(blog)}>remove</button>
        </>
      )
  }

  const showDetails = () => (
    <>
      <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
        <li id='blog-url'>{blog.url}</li>
        <li id='blog-likes'>
          likes: {blog.likes}
          <button onClick={() => handleLike(blog)} id='handle-like-button'>
            like
          </button>
        </li>
        <li>{blog.user.name}</li>
        {showDeleteButton()}
      </ul>
    </>
  )

  return (
    <div style={blogStyle}>
      <div id='blog-title' style={{ display: 'inline' }}>{blog.title} </div>
      <div id='blog-author' style={{ display: 'inline' }}>{blog.author} </div>
      <button onClick={toggleVisibility} id='toggle-visibility-button'>
        {visible ? 'hide' : 'show'}
      </button>
      {visible && showDetails()}
    </div>
  )
}

export default Blog