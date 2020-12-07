const _ = require('lodash')

const dummy = (blogs) => {
  return blogs ? 1 : 0
}

const totalLikes = (blogs) => {
  if (blogs.length === 0)
    return null

  return blogs.reduce((sum, blogEntry) => sum + blogEntry.likes, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0)
    return null

  const likes = blogs.map((blog) => blog.likes)
  const maxLikes = Math.max(...likes)
  return blogs.find(blog => blog.likes === maxLikes)
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0)
    return null

  const numBlogsByAuthor = _.countBy(blogs, 'author')
  return _.maxBy(_.keys(numBlogsByAuthor), function (input) { return numBlogsByAuthor[input] })
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs
}