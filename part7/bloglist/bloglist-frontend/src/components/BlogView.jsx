import { useState } from 'react'
import blogService from '../services/blogs'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'
import NotificationContext from '../NotificationContext'

const BlogView = ({ blog, handleLike, currentUser, handleRemove }) => {
  const [comment, setComment] = useState('')
  const { notify } = useContext(NotificationContext)
  const queryClient = useQueryClient()

  const addCommentMutation = useMutation({
    mutationFn: ({ blogId, commentObj }) => blogService.addComment(blogId, commentObj),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
    },
  })

  if (!blog) return null

  const addComment = async (event) => {
    event.preventDefault()

    try {
      await addCommentMutation.mutateAsync({ blogId: blog.id, commentObj: { content: comment } })
      setComment('')
      notify({
        notification_type: 'success',
        message: `comment successfully added`,
      }, 5)
    } catch (error) {
      notify({
        notification_type: 'error',
        message: `error adding comment`,
      }, 5)
    }
  }

  const showDeleteButton = () => {
    if (currentUser.username === blog.user.username)
      return (
        <>
          <button onClick={() => handleRemove(blog)}>remove</button>
        </>
      )
  }

  const showComments = () => (
    <div>
      <h3>comments</h3>
      <form onSubmit={addComment}>
        <div style={{ paddingBottom: 10 }}>
          <input type='text' value={comment} onChange={({ target }) => setComment(target.value)} />
          <button type='submit'>add comment</button>
        </div>
      </form>
      <ul>
        {blog.comments.map((comment) => (
          <li key={comment.id}>{comment.content}</li>
        ))}
      </ul>
    </div>
  )

  return (
    <div>
      <h2>
        <em>{blog.title}</em>
        {' by '}
        {blog.author}
      </h2>
      <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
        <li>url: {blog.url}</li>
        <li>
          likes: {blog.likes}{' '}
          <button onClick={() => handleLike(blog)} id='handle-like-button'>
            like
          </button>
        </li>
        <li>created by: {blog.user.name}</li>
        {showDeleteButton()}
        {showComments()}
      </ul>
    </div>
  )
}

export default BlogView
