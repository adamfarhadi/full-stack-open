const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const Comment = require('../models/comment')
const userExtractor = require('../utils/middleware').userExtractor

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1, _id: 1 })
    .populate('comments', { content: 1, _id: 1 })
  response.json(blogs)
})

blogsRouter.post('/', userExtractor, async (request, response) => {
  const user = request.user

  const blog = new Blog({
    title: request.body.title,
    author: request.body.author,
    url: request.body.url,
    likes: request.body.likes || 0,
    user: user._id
  })

  await blog.save()
  const savedBlog = await blog.populate('user', { username: 1, name: 1, _id: 1 })
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  const user = request.user

  const blog = await Blog.findById(request.params.id)

  if (!blog) {
    return response.status(204).end()
  }

  if (blog.user.toString() !== user._id.toString()) {
    return response.status(403).json({ error: 'user is unauthorized to perform the operation' })
  }

  const blogComments = blog.comments
  console.log('blogComments: ', blogComments)

  await blog.deleteOne()

  user.blogs = user.blogs.filter(b => b._id.toString() !== blog._id.toString())
  await user.save()

  await Comment.deleteMany({ _id: { $in : blogComments } })

  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body
  const blog = { ...body }
  const updatedBlog = await Blog
    .findByIdAndUpdate(request.params.id, blog, { new: true })
    .populate('user', { username: 1, name: 1, _id: 1 })

  if (!updatedBlog) {
    return response.status(404).end()
  }

  response.status(200).json(updatedBlog)
})

blogsRouter.post('/:id/comments', async (request, response) => {
  const body = request.body

  const blog = await Blog.findById(request.params.id)

  if(!blog) {
    return response.status(404).end()
  }

  const newComment = Comment({
    content: body.content,
    blog: blog._id
  })

  await newComment.save()
  blog.comments = blog.comments.concat(newComment)
  await blog.save()
  const savedBlog = await blog.populate('comments', { content: 1, _id: 1 })
  return response.status(201).json(savedBlog)
})

module.exports = blogsRouter