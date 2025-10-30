var _ = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return {}

  const largestlikes = Math.max(...blogs.map(blog => blog.likes))
  return blogs.find(blog => blog.likes === largestlikes)
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return {}

  const numBlogsByAuthor = _.countBy(blogs, 'author')
  const authorWithMostBlogs = _.maxBy(_.keys(numBlogsByAuthor), input => numBlogsByAuthor[input] )

  return { author: authorWithMostBlogs, blogs: numBlogsByAuthor[authorWithMostBlogs] }
}

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs }