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

const App = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const { notify } = useContext(NotificationContext)

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
    setUser(null)
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

  if (result.isError) {
    return <div>blog service not available due to problems in server</div>
  }

  if (result.isLoading) {
    return <div>loading blogs...</div>
  }

  const blogs = result.data

  return (
    <div>
      {!user && loginForm()}
      {user && blogForm()}
    </div>
  )
}

export default App
