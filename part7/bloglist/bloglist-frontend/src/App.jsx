import { useState, useEffect, useRef, useContext } from 'react'
import Blog from './components/Blog'
import Notification from './components/Notification'
import blogService from './services/blogs'
import loginService from './services/login'
import './index.css'
import Togglable from './components/Togglable'
import AddNewBlogForm from './components/AddNewBlogForm'
import NotificationContext from './NotificationContext'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import UserContext from './UserContext'
import Users from './components/Users'

import { Routes, Route, Link, } from 'react-router-dom'

const App = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { notify } = useContext(NotificationContext)
  const { user, userDispatch } = useContext(UserContext)

  const queryClient = useQueryClient()

  const blogFormRef = useRef()

  const result = useQuery({
    queryKey: ['blogs'],
    queryFn: blogService.getAll,
    refetchOnWindowFocus: false,
  })

  const updateBlogMutation = useMutation({
    mutationFn: blogService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
    },
  })

  const deleteBlogMutation = useMutation({
    mutationFn: blogService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
    },
  })

  const createBlogMutation = useMutation({
    mutationFn: blogService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
    },
  })

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedInBlogAppUser')
    if (loggedUserJSON) {
      const loggedInUser = JSON.parse(loggedUserJSON)
      userDispatch({
        type: 'SET_USER',
        payload: loggedInUser,
      })
      blogService.setToken(loggedInUser.token)
    }
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const loggedInUser = await loginService.login({ username, password })
      window.localStorage.setItem('loggedInBlogAppUser', JSON.stringify(loggedInUser))
      blogService.setToken(loggedInUser.token)

      userDispatch({
        type: 'SET_USER',
        payload: loggedInUser,
      })

      setUsername('')
      setPassword('')
    } catch {
      notify(
        {
          notification_type: 'error',
          message: 'wrong username or password',
        },
        5
      )
    }
  }

  const handleLogout = async () => {
    userDispatch({
      type: 'CLEAR_USER',
    })
    window.localStorage.removeItem('loggedInBlogAppUser')
  }

  const addBlog = async (blogObject) => {
    try {
      blogFormRef.current.toggleVisibility()

      const returnedBlog = await createBlogMutation.mutateAsync(blogObject)

      notify(
        {
          notification_type: 'success',
          message: `a new blog ${returnedBlog.title} by ${returnedBlog.author} added`,
        },
        5
      )
    } catch {
      notify(
        {
          notification_type: 'error',
          message: `error adding blog ${blogObject.title} by ${blogObject.author}`,
        },
        5
      )
    }
  }

  const handleLike = async (blogObject) => {
    try {
      const blogToUpdate = {
        ...blogObject,
        likes: blogObject.likes + 1,
        user: blogObject.user.id,
      }
      await updateBlogMutation.mutateAsync(blogToUpdate)
    } catch {
      notify(
        {
          notification_type: 'error',
          message: `error liking blog ${blogObject.title}`,
        },
        5
      )
    }
  }

  const handleRemove = async (blogObject) => {
    try {
      const blogToRemove = { ...blogObject }
      if (window.confirm(`Are you sure you want to remove blog ${blogToRemove.title} by ${blogToRemove.author}?`)) {
        await deleteBlogMutation.mutateAsync(blogToRemove.id)

        notify(
          {
            notification_type: 'success',
            message: `blog ${blogObject.title} successfully deleted`,
          },
          5
        )
      }
    } catch {
      notify(
        {
          notification_type: 'error',
          message: `error deleting blog ${blogObject.title}`,
        },
        5
      )
    }
  }

  const blogForm = () => (
    <div>
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

  if (result.isError) {
    return <div>blog service not available due to problems in server</div>
  }

  if (result.isLoading) {
    return <div>loading blogs...</div>
  }

  const blogs = result.data

  if (!user) {
    return loginForm()
  }

  return (
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
      <Routes>
        <Route path='/' element={blogForm()} />
        <Route path='/users/*' element={<Users />} />
      </Routes>
    </div>
  )
}

export default App
