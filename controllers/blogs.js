const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const { tokenExtractor, userExtractor } = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1, id: 1 })
  response.json(blogs)
})

blogsRouter.post('/', tokenExtractor, userExtractor, async (request, response) => {
  const { title, author, url, likes } = request.body
  const { user } = request

  const blog = new Blog({
    title,
    author,
    url,
    likes,
    user: user.id,
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog.id)
  await user.save()
  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', tokenExtractor, userExtractor, async (request, response) => {
  const { user } = request

  const blog = await Blog.findById(request.params.id)
  if (user.id.toString() === blog.user.toString()) {
    await blog.remove()
    response.status(204).end()
  } else {
    response.status(403).json({
      error: 'you can only delete blogs that you have created',
    })
  }
})

blogsRouter.put('/:id', async (request, response) => {
  const { title, author, url, likes } = request.body

  const newBlog = {
    title,
    author,
    url,
    likes,
  }

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, newBlog, { new: true })
  response.status(200).json(updatedBlog)
})

module.exports = blogsRouter
