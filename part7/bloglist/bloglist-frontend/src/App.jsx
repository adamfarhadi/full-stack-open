import { useState, useEffect, useRef, useContext } from 'react'
import Blog from './components/Blog'
import Notification from './components/Notification'
import blogService from './services/blogs'
import loginService from './services/login'
import './index.css'
import Togglable from './components/Togglable'
import AddNewBlogForm from './components/AddNewBlogForm'
import NotificationContext from './NotificationContext'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const { notificationDispatch } = useContext(NotificationContext)

  const blogFormRef = useRef()

  useEffect(() => {
    blogService.getAll().then((blogs) => setBlogs(blogs))
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedInBlogAppUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const user = await loginService.login({ username, password })
      window.localStorage.setItem('loggedInBlogAppUser', JSON.stringify(user))
      blogService.setToken(user.token)

      setUser(user)
      setUsername('')
      setPassword('')
    } catch {
      notificationDispatch({
        type: 'SET_NOTIFICATION',
        payload: {
          notification_type: 'error',
          message: 'wrong username or password',
        },
      })
      setTimeout(() => {
        notificationDispatch({ type: 'RESET_NOTIFICATION' })
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

      notificationDispatch({
        type: 'SET_NOTIFICATION',
        payload: {
          notification_type: 'success',
          message: `a new blog ${returnedBlog.title} by ${returnedBlog.author} added`,
        },
      })
      setTimeout(() => {
        notificationDispatch({ type: 'RESET_NOTIFICATION' })
      }, 5000)
    } catch {
      notificationDispatch({
        type: 'SET_NOTIFICATION',
        payload: {
          notification_type: 'error',
          message: `error adding blog ${blogObject.title} by ${blogObject.author}`,
        },
      })
      setTimeout(() => {
        notificationDispatch({ type: 'RESET_NOTIFICATION' })
      }, 5000)
    }
  }

  const handleLike = async (blogObject) => {
    try {
      const blogToUpdate = {
        ...blogObject,
        likes: blogObject.likes + 1,
        user: blogObject.user.id,
      }
      const updatedBlog = await blogService.update(blogToUpdate.id, blogToUpdate)
      setBlogs(blogs.map((b) => (b.id === updatedBlog.id ? updatedBlog : b)))
    } catch {
      notificationDispatch({
        type: 'SET_NOTIFICATION',
        payload: {
          notification_type: 'error',
          message: `error liking blog ${blogObject.title}`,
        },
      })
      setTimeout(() => {
        notificationDispatch({ type: 'RESET_NOTIFICATION' })
      }, 5000)
    }
  }

  const handleRemove = async (blogObject) => {
    try {
      const blogToRemove = { ...blogObject }
      if (window.confirm(`Are you sure you want to remove blog ${blogToRemove.title} by ${blogToRemove.author}?`)) {
        await blogService.remove(blogToRemove.id)
        setBlogs(blogs.filter((b) => b.id !== blogToRemove.id))

        notificationDispatch({
          type: 'SET_NOTIFICATION',
          payload: {
            notification_type: 'success',
            message: `blog ${blogObject.title} successfully deleted`,
          },
        })
        setTimeout(() => {
          notificationDispatch({ type: 'RESET_NOTIFICATION' })
        }, 5000)
      }
    } catch {
      notificationDispatch({
        type: 'SET_NOTIFICATION',
        payload: {
          notification_type: 'error',
          message: `error deleting blog ${blogObject.title}`,
        },
      })
      setTimeout(() => {
        notificationDispatch({ type: 'RESET_NOTIFICATION' })
      }, 5000)
    }
  }

  const blogForm = () => (
    <div>
      <h2>blogs</h2>
      <Notification />
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
      {blogs
        .sort((a, b) => b.likes - a.likes)
        .map((blog) => (
          <Blog key={blog.id} blog={blog} handleLike={handleLike} currentUser={user} handleRemove={handleRemove} />
        ))}
    </div>
  )

  const loginForm = () => (
    <div>
      <h1>log in to application</h1>
      <Notification />
      <form onSubmit={handleLogin}>
        <div>
          <label>
            username
            <input type='text' value={username} onChange={({ target }) => setUsername(target.value)} />
          </label>
        </div>
        <div>
          <label>
            password
            <input type='password' value={password} onChange={({ target }) => setPassword(target.value)} />
          </label>
        </div>
        <button type='submit'>login</button>
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
