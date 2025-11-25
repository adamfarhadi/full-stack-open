import { useState, useEffect, useRef, useContext } from 'react'
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

import { Routes, Route, Link, useMatch, useNavigate } from 'react-router-dom'
import BlogView from './components/BlogView'
import {
  Paper,
  TableBody,
  TableContainer,
  TableRow,
  Table,
  TableCell,
  TableHead,
  TextField,
  Button,
  Typography,
  Alert,
  Toolbar,
  AppBar,
  Box,
} from '@mui/material'

const App = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { notify } = useContext(NotificationContext)
  const { user, userDispatch } = useContext(UserContext)
  const queryClient = useQueryClient()
  const blogFormRef = useRef()
  const navigate = useNavigate()

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
        comments: blogObject.comments.map((comment) => comment.id),
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

        navigate('/')
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
      <Typography variant='h3' gutterBottom>
        Blogs
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Blog</TableCell>
              <TableCell>Author</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {blogs
              .sort((a, b) => b.likes - a.likes)
              .map((blog) => (
                <TableRow key={blog.id}>
                  <TableCell>
                    <Link to={`/blogs/${blog.id}`}>{blog.title}</Link>
                  </TableCell>
                  <TableCell>{blog.author}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )

  const loginForm = () => (
    <div>
      <Typography variant='h2' gutterBottom>
        Login to Blog App
      </Typography>
      <Notification />
      <form onSubmit={handleLogin}>
        <div>
          <TextField label='username' value={username} onChange={({ target }) => setUsername(target.value)} />
        </div>
        <div>
          <TextField
            label='password'
            type='password'
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <Button variant='contained' color='primary' type='submit'>
          login
        </Button>
      </form>
    </div>
  )

  const blogs = result.data

  const match = useMatch('/blogs/:id')

  if (result.isError) {
    return <div>blog service not available due to problems in server</div>
  }

  if (result.isLoading) {
    return <div>loading blogs...</div>
  }

  if (!user) {
    return loginForm()
  }

  const blog = match ? blogs.find((b) => b.id === match.params.id) : null

  return (
    <div>
      <AppBar position='static'>
        <Toolbar>
          <Button color='inherit' component={Link} to='/'>
            home
          </Button>
          <Button color='inherit' component={Link} to='/users'>
            users
          </Button>
          <Button color='inherit' onClick={handleLogout}>
            logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ mt: 2 }}>
        <Typography variant='body1' gutterBottom>
          {user.name} logged in{' '}
        </Typography>
      </Box>

      <Typography variant='h2' gutterBottom>
        Blog App
      </Typography>

      <Notification />
      <Routes>
        <Route path='/' element={blogForm()} />
        <Route path='/users/*' element={<Users />} />
        <Route
          path='blogs/:id'
          element={<BlogView blog={blog} handleLike={handleLike} currentUser={user} handleRemove={handleRemove} />}
        />
      </Routes>
    </div>
  )
}

export default App
