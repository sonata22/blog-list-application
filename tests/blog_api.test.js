const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
//mongoose.set("bufferTimeoutMS", 30000)

// The tests only use the express application defined in the app.js file, which does not
// listen to any ports. The documentation for supertest says: if the server is not already
// listening for connections then it is bound to an ephemeral port for you so there is no
// need to keep track of ports. In other words, supertest takes care that the application 
// being tested is started at the port that it uses internally.

const api = supertest(app)

const Blog = require('../models/blog')

beforeEach(async () => {
    await Blog.deleteMany({})

    // this way we wait for all promises to finish executing before
    // starting to run test cases
    const blogObjects = helper.initialBlogs
        .map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
})

test('a specific blog can be viewed', async () => {
    const blogsAtStart = await helper.blogsInDb()

    const blogToView = blogsAtStart[0]

    const resultBlog = await api
        .get(`/api/blogs/${blogToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    expect(resultBlog.body).toEqual(blogToView)
})

test('a blog can be deleted', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]


    await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
        helper.initialBlogs.length - 1
    )

    const contents = blogsAtEnd.map(r => r.title)

    expect(contents).not.toContain(blogToDelete.title)
})

test('blogs are returned as json', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
}, 100000)

test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    // execution gets here only after the HTTP request is complete
    // the result of HTTP request is saved in variable response
    expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('a specific blog is within a returned blogs', async () => {
    const response = await api.get('/api/blogs')

    const contents = response.body.map(r => r.title)
    expect(contents).toContain(
        'Browser can execute only JavaScript'
    )
})

test('a valid blog can be added', async () => {
    const newBlog = {
        title: 'async/await simplifies making async calls',
        author: 'Humble me',
        url: 'https://www.google.com',
        likes: "99",
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const contents = blogsAtEnd.map(b => b.title)

    expect(contents).toContain(
        'async/await simplifies making async calls'
    )
})

test('blog without content is not added', async () => {
    const newBlog = {
        author: "Moomin",
        url: 'https://google.com',
        likes: '57',
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
})

afterAll(async () => {
    await mongoose.connection.close()
})