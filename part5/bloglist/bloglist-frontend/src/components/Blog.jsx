import { useState } from "react"

const Blog = ({ blog }) => {
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

  const showDetails = () => (
    <>
      <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
        <li>{blog.url}</li>
        <li>
          likes: {blog.likes}
          <button>
            like
          </button>
        </li>
        <li>{blog.user.name}</li>
      </ul>
    </>
  )

  return (
    <div style={blogStyle}>
      {blog.title} {blog.author}
      <button onClick={toggleVisibility}>
        {visible ? 'hide' : 'show'}
      </button>
      {visible && showDetails()}
    </div>
  )
}

export default Blog