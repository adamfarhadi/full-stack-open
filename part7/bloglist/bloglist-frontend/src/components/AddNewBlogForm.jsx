import { Button, TextField, Typography } from '@mui/material'
import { useState } from 'react'

const AddNewBlogForm = ({ createBlog }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  const addBlog = (event) => {
    event.preventDefault()
    createBlog({ title, author, url })
    setTitle('')
    setAuthor('')
    setUrl('')
  }

  return (
    <div>
      <Typography variant='h4' gutterBottom>
        Create New
      </Typography>
      <form onSubmit={addBlog}>
        <div>
          <TextField label='title' type='text' value={title} onChange={({ target }) => setTitle(target.value)} />
        </div>
        <div>
          <TextField label='author' type='text' value={author} onChange={({ target }) => setAuthor(target.value)} />
        </div>
        <div>
          <TextField label='url' type='text' value={url} onChange={({ target }) => setUrl(target.value)} />
        </div>
        <Button variant='contained' color='primary' type='submit'>
          create
        </Button>
      </form>
    </div>
  )
}

export default AddNewBlogForm
