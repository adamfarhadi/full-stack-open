import React, { useState, useEffect, useRef } from 'react'

import Blog from './components/Blog'
import Notification from './components/Notification'
import Togglable from './components/Togglable'
import BlogForm from './components/BlogForm'

import blogService from './services/blogs'
import loginService from './services/login'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [notification, setNotification] = useState({ message: null, type: null })

  const blogFormRef = useRef()

  useEffect(() => {
    refreshBlogs()
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedInUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const user = await loginService.login({
        username, password,
      })

      window.localStorage.setItem('loggedInUser', JSON.stringify(user))
      blogService.setToken(user.token)

      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      setNotification({ ...notification, message: `invalid username or password`, type: "error" })
      setTimeout(() => {
        setNotification({ ...notification, message: null, type: null })
      }, 5000)
    }
  }

  const handleLogout = async (event) => {
    event.preventDefault()

    window.localStorage.removeItem('loggedInUser')
    blogService.setToken(null)

    setUser(null)
    setUsername('')
    setPassword('')
  }

  const addBlog = async (blogObject) => {

    try {
      blogFormRef.current.toggleVisibility()
      const returnedBlog = await blogService.create(blogObject)

      await refreshBlogs()

      setNotification({ ...notification, message: `a new blog \"${returnedBlog.title}\" added`, type: "notification" })
      setTimeout(() => {
        setNotification({ ...notification, message: null, type: null })
      }, 5000)
    } catch (exception) {
      setNotification({ ...notification, message: exception.response.data.error, type: "error" })
      setTimeout(() => {
        setNotification({ ...notification, message: null, type: null })
      }, 5000)
    }
  }

  const handleLike = async (blog) => {
    const updatedBlog = { ...blog, likes: blog.likes + 1, user: blog.user.id }

    try {
      await blogService.update(blog.id, updatedBlog)
      refreshBlogs()
    } catch (exception) {
      setNotification({ ...notification, message: exception.response.data.error, type: "error" })
      setTimeout(() => {
        setNotification({ ...notification, message: null, type: null })
      }, 5000)
    }
  }

  const handleRemove = async (blog) => {

    if (window.confirm(`Are you sure you want to remove blog \"${blog.title}\" by \"${blog.author}\"?`)) {
      try {
        const returnedBlog = await blogService.remove(blog.id)
        await refreshBlogs()

        setNotification({ ...notification, message: `blog \"${blog.title}\" by \"${blog.author}\" removed`, type: "notification" })
        setTimeout(() => {
          setNotification({ ...notification, message: null, type: null })
        }, 5000)
      } catch (exception) {
        setNotification({ ...notification, message: exception.response.data.error, type: "error" })
        setTimeout(() => {
          setNotification({ ...notification, message: null, type: null })
        }, 5000)
      }
    }
  }

  const refreshBlogs = async () => {
    const blogs = await blogService.getAll()
    setBlogs(blogs)
  }

  const blogForm = () => (
    <>
      <h2>blogs</h2>
      <Notification message={notification.message} type={notification.type} />
      <p>
        {user.name} logged in
        <button onClick={handleLogout}>logout</button>
      </p>

      <Togglable buttonLabel="new blog" ref={blogFormRef}>
        <BlogForm createBlog={addBlog}></BlogForm>
      </Togglable>

      <br></br>

      {blogs
        .sort((a, b) => b.likes - a.likes)
        .map(blog =>
          <Blog
            key={blog.id}
            blog={blog}
            user={user}
            handleLike={handleLike}
            handleRemove={handleRemove}
          />
        )
      }
    </>
  )

  const loginForm = () => (
    <>
      <h2>log in to application</h2>
      <Notification message={notification.message} type={notification.type} />
      <form onSubmit={handleLogin}>
        <div>
          username
          <input
            type="text"
            value={username}
            name="Username"
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password
          <input
            type="password"
            value={password}
            name="Password"
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type="submit">login</button>
      </form>
    </>
  )

  return (
    <div>
      {user === null ?
        loginForm() :
        blogForm()
      }
    </div>
  )
}

export default App