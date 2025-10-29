require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const blogsRouter = require('./controllers/blogs')

const app = express()

const url = process.env.MONGODB_URI

console.log('connecting to', url)
mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

app.use(express.json())

app.use('/api/blogs',blogsRouter)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})