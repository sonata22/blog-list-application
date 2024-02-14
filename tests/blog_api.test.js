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

describe('when there is initially some blogs saved', () => {
    test('blogs are returned as json', async () => {
        const response = await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        expect(response.body).toHaveLength(helper.initialBlogs.length)
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

    describe('viewing a specific blog', () => {
        test('a specific blog can be viewed', async () => {
            const blogsAtStart = await helper.blogsInDb()

            const blogToView = blogsAtStart[0]

            const resultBlog = await api
                .get(`/api/blogs/${blogToView.id}`)
                .expect(200)
                .expect('Content-Type', /application\/json/)

            expect(resultBlog.body).toEqual(blogToView)
        })

        test('succeeds with a valid id', async () => {
            const blogsAtStart = await helper.blogsInDb()

            const blogToView = blogsAtStart[0]

            const resultBlog = await api
                .get(`/api/blogs/${blogToView.id}`)
                .expect(200)
                .expect('Content-Type', /application\/json/)

            expect(resultBlog.body).toEqual(blogToView)
        })

        test('fails with statuscode 404 if blog does not exist', async () => {
            const validNonexistingId = await helper.nonExistingId()

            await api
                .get(`/api/blogs/${validNonexistingId}`)
                .expect(404)
        })

        test('fails with statuscode 400 if id is invalid', async () => {
            const invalidId = '5a3d5da59070081a82a3445'

            await api
                .get(`/api/blogs/${invalidId}`)
                .expect(400)
        })

    })

    describe('addition of a new blog', () => {
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

        test('verify blog is not created if title is missing', async () => {
            const newBlog = {
                author: 'Humble me',
                url: 'https://www.google.com',
                likes: 3,
            }

            await api
                .post('/api/blogs')
                .send(newBlog)
                .expect(400)
        })

        test('blog without title is not added', async () => {
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

        test('verify blog is not created if url is missing', async () => {
            const newBlog = {
                title: 'async/await simplifies making async calls',
                author: 'Humble me',
                likes: 3,
            }

            await api
                .post('/api/blogs')
                .send(newBlog)
                .expect(400)
        })

        test('verify blog is not created if author is missing', async () => {
            const newBlog = {
                title: 'async/await simplifies making async calls',
                url: 'https://www.google.com',
                likes: 3,
            }

            await api
                .post('/api/blogs')
                .send(newBlog)
                .expect(400)
        })

    })

    describe('deletion of a blog', () => {
        test('blog is deleted if data is valid', async () => {
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

        test('blog is not deleted if data is invalid', async () => {
            const validNonexistingId = await helper.nonExistingId()

            await api
                .delete(`/api/blogs/${validNonexistingId}`)
                .expect(204)

            const blogsAtEnd = await helper.blogsInDb()

            expect(blogsAtEnd).toHaveLength(
                helper.initialBlogs.length
            )
        })

    })

    describe('verify all properties defined', () => {
        test('blogs have id property defined', async () => {
            const response = await api
                .get('/api/blogs')
                .expect(200)
            response.body.forEach(blog =>
                expect(blog.id).toBeDefined()
            )
        }, 100000)

        test('verify likes equal to 0 if not defined', async () => {
            const newBlog = {
                title: 'async/await simplifies making async calls',
                author: 'Humble me',
                url: 'https://www.google.com',
            }

            await api
                .post('/api/blogs')
                .send(newBlog)
                .expect(201)
                .expect('Content-Type', /application\/json/)

            const blogsAtEnd = await helper.blogsInDb()
            expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
            const contents = blogsAtEnd.map(b => b.likes)

            expect(contents).toContain(0)
        })

    })

    describe('blog editing', () => {
        test('number of likes can be edited', async () => {
            const response = await api.get('/api/blogs')
            const firstDbBlog = response.body[0]
            const editedBlog = {
                title: firstDbBlog.title,
                author: firstDbBlog.author,
                url: firstDbBlog.url,
                likes: 237493,
                id: firstDbBlog.id,
            }

            const editedBlogFetched = await api
                .put(`/api/blogs/${editedBlog.id}`)
                .send(editedBlog)
                .expect(200)
            expect(editedBlogFetched.body.likes).toEqual(editedBlog.likes)
        })

        test('title can be edited', async () => {
            const response = await api.get('/api/blogs')
            const firstDbBlog = response.body[0]
            const editedBlog = {
                title: "OhoHO, the title was changed",
                author: firstDbBlog.author,
                url: firstDbBlog.url,
                likes: firstDbBlog.likes,
                id: firstDbBlog.id,
            }

            const editedBlogFetched = await api
                .put(`/api/blogs/${editedBlog.id}`)
                .send(editedBlog)
                .expect(200)
            expect(editedBlogFetched.body.title).toEqual(editedBlog.title)
        })

        test('author can be edited', async () => {
            const response = await api.get('/api/blogs')
            const firstDbBlog = response.body[0]
            const editedBlog = {
                title: firstDbBlog.title,
                author: "Nataliia Samoilenko",
                url: firstDbBlog.url,
                likes: firstDbBlog.likes,
                id: firstDbBlog.id,
            }

            const editedBlogFetched = await api
                .put(`/api/blogs/${editedBlog.id}`)
                .send(editedBlog)
                .expect(200)
            expect(editedBlogFetched.body.author).toEqual(editedBlog.author)
        })

        test('blog can be edited', async () => {
            const response = await api.get('/api/blogs')
            const firstDbBlog = response.body[0]
            const editedBlog = {
                title: "The new era of AI",
                author: "Natali Samoilenko",
                url: "https://www.google.com/",
                likes: 89375934758349,
                id: firstDbBlog.id,
            }

            const editedBlogFetched = await api
                .put(`/api/blogs/${editedBlog.id}`)
                .send(editedBlog)
                .expect(200)
            expect(editedBlogFetched.body.author).toEqual(editedBlog.author)
            expect(editedBlogFetched.body.title).toEqual(editedBlog.title)
            expect(editedBlogFetched.body.url).toEqual(editedBlog.url)
            expect(editedBlogFetched.body.likes).toEqual(editedBlog.likes)
        })
    })

})

afterAll(async () => {
    await mongoose.connection.close()
})