// const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

const Blog = require('../models/blog')
const helper = require('./api_test_helper')

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

test('each blog has an "id" property', async () => {
  const response = await api.get('/api/blogs')
  response.body.forEach((blog) => expect(blog.id).toBeDefined())
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('adding a blog correctly', async () => {
  const newBlog = {
    title: 'Testing title',
    author: 'Testy Tester',
    url: 'https://test.test/',
    likes: 5,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

  const titles = blogsAtEnd.map((blog) => blog.title)
  expect(titles).toContain('Testing title')
})

test('adding a blog without likes property that should default 0', async () => {
  const newBlog = {
    title: 'Testing title',
    author: 'Testy Tester',
    url: 'https://test.test/',
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')
  response.body.forEach((blog) => expect(blog.likes).toBeDefined())
})

test.only('adding a blog without url or title fails with status 400', async () => {
  const blogNoUrl = {
    title: 'Testing title',
    author: 'Testy Tester',
    likes: 5,
  }

  const blogNoTitle = {
    author: 'Testy Tester',
    url: 'http://aaa.com',
    likes: 5,
  }

  await api
    .post('/api/blogs')
    .send(blogNoUrl)
    .expect(400)

  await api
    .post('/api/blogs')
    .send(blogNoTitle)
    .expect(400)
})
