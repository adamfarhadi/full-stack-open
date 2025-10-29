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

module.exports = { dummy, totalLikes, favoriteBlog }