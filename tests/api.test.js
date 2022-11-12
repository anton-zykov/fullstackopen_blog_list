// const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

const bcrypt = require('bcrypt')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
//  await User.deleteMany({})
//  await User.insertMany(helper.InitialUsers)
})

describe('blogs recieve their id\'s and return', () => {
  test('each blog has an "id" property', async () => {
    const response = await api.get('/api/blogs')
    response.body.forEach((blog) => expect(blog.id).toBeDefined())
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })
})

describe('adding a blog', () => {
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

  test('adding a blog without url or title fails with status 400', async () => {
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
})

describe('deletion of a blog', () => {
  test('succeedes with status 204', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

    const titles = blogsAtEnd.map((r) => r.title)

    expect(titles).not.toContain(blogToDelete.title)
  })
})

describe('updating a blog', () => {
  test('succeeds with status 200', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const newBlog = {
      id: blogToUpdate.id,
      title: 'Testing title',
      author: 'Testy Tester',
      url: 'https://test.test/',
      likes: 5,
    }

    const returnedNewBlog = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const returnedNewBlogObject = JSON.parse(JSON.stringify(newBlog))

    expect(returnedNewBlog.body).toEqual(returnedNewBlogObject)
  })
})

describe.only('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', name: 'root name', passwordHash })

    await user.save()
  })

  test('new user is succefully created', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'azykov',
      name: 'Anton Zykov',
      password: '12345',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map((u) => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails if username is already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('Username already exists.')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)
  })

  test('creation fails if username is shorter than 3 symbols', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'az',
      name: 'Anton Zykov',
      password: '12345',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('Username must be at least 3 characters long.')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)
  })

  test('creation fails if password is shorter than 3 symbols', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'azykov',
      name: 'Anton Zykov',
      password: '12',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('Password must be at least 3 characters long.')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)
  })
})
