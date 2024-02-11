const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
//mongoose.set("bufferTimeoutMS", 30000)

// The tests only use the express application defined in the app.js file, which does not
// listen to any ports. The documentation for supertest says: if the server is not already
// listening for connections then it is bound to an ephemeral port for you so there is no
// need to keep track of ports. In other words, supertest takes care that the application 
// being tested is started at the port that it uses internally.

const api = supertest(app)

const Blog = require('../models/blog')

const initialBlogs = [
    {
        title: 'HTML is easy',
        author: 'Herbert',
        url: 'https://www.wikipedia.org/',
        likes: '15',
    },
    {
        title: 'Browser can execute only JavaScript',
        author: 'Rudolf',
        url: 'https://www.wikipedia.org/',
        likes: '2',
    }
]

beforeEach(async () => {
    await Blog.deleteMany({})
    let blogObject = new Blog(initialBlogs[0])
    await blogObject.save()
    blogObject = new Blog(initialBlogs[1])
    await blogObject.save()
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
    expect(response.body).toHaveLength(initialBlogs.length)
})

test('a specific blog is within a returned blogs', async () => {
    const response = await api.get('/api/blogs')

    const contents = response.body.map(r => r.title)
    expect(contents).toContain(
        'Browser can execute only JavaScript'
    )
})

afterAll(async () => {
    await mongoose.connection.close()
})