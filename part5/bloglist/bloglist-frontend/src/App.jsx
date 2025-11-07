import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import Notification from './components/Notification'
import blogService from './services/blogs'
import loginService from './services/login'
import './index.css'
import Togglable from './components/Togglable'
import AddNewBlogForm from './components/AddNewBlogForm'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [notification, setNotification] = useState({ notification_type: null, message: null })

  const blogFormRef = useRef()

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs(blogs)
    )
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedInBlogAppUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const handleLogin = async event => {
    event.preventDefault()

    try {
      const user = await loginService.login({ username, password })
      window.localStorage.setItem(
        'loggedInBlogAppUser', JSON.stringify(user)
      )
      blogService.setToken(user.token)

      setUser(user)
      setUsername('')
      setPassword('')
    } catch {
      setNotification(
        { notification_type: "error", message: 'wrong username or password' }
      )
      setTimeout(() => {
        setNotification({ notification_type: null, message: null })
      }, 5000)
    }
  }

  const handleLogout = async () => {
    setUser(null)
    window.localStorage.removeItem('loggedInBlogAppUser')
  }

  const addBlog = async (blogObject) => {
    try {
      blogFormRef.current.toggleVisibility()
      const returnedBlog = await blogService.create(blogObject)
      setBlogs(blogs.concat(returnedBlog))

      setNotification(
        { notification_type: "success", message: `a new blog ${returnedBlog.title} by ${returnedBlog.author} added` }
      )
      setTimeout(() => {
        setNotification({ notification_type: null, message: null })
      }, 5000)

    } catch {
      setNotification(
        { notification_type: "error", message: `error adding blog ${blogObject.title} by ${blogObject.author}` }
      )
      setTimeout(() => {
        setNotification({ notification_type: null, message: null })
      }, 5000)
    }
  }

  const handleLike = async blogObject => {
    try {
      const blogToUpdate = { ...blogObject, likes: blogObject.likes + 1, user: blogObject.user.id }
      const updatedBlog = await blogService.update(blogToUpdate.id, blogToUpdate)
      setBlogs(blogs.map(b => b.id === updatedBlog.id ? updatedBlog : b))
    } catch {
      setNotification(
        { notification_type: "error", message: `error liking blog ${blogObject.title}` }
      )
      setTimeout(() => {
        setNotification({ notification_type: null, message: null })
      }, 5000)
    }
  }

  const blogForm = () => (
    <div>
      <h2>blogs</h2>
      <Notification notification_type={notification.notification_type} message={notification.message} />
      {
        <p>
          {user.name} logged in
          <button type='button' onClick={handleLogout}>
            logout
          </button>
        </p>
      }
      <Togglable buttonLabel='create new blog' ref={blogFormRef}>
        <AddNewBlogForm createBlog={addBlog} />
      </Togglable>
      {blogs.map(blog =>
        <Blog key={blog.id} blog={blog} handleLike={handleLike} />
      )}
    </div>
  )

  const loginForm = () => (
    <div>
      <h1>log in to application</h1>
      <Notification notification_type={notification.notification_type} message={notification.message} />
      <form onSubmit={handleLogin}>
        <div>
          <label>
            username
            <input
              type="text"
              value={username}
              onChange={({ target }) => setUsername(target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            password
            <input
              type="password"
              value={password}
              onChange={({ target }) => setPassword(target.value)}
            />
          </label>
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  )

  return (
    <div>
      {!user && loginForm()}
      {user && blogForm()}
    </div>
  )
}

export default App