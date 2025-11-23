const BlogView = ({ blog, handleLike, currentUser, handleRemove }) => {
  if (!blog) return null

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
      <ul>
        {blog.comments.map(comment => <li key={comment.id}>{comment.content}</li>)}
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
