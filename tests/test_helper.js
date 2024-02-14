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

const nonExistingId = async () => {
    const blog = new Blog({ title: 'willremovethissoon' })
    await blog.save()
    await blog.deleteOne()

    return blog._id.toString()
}

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

module.exports = {
    initialBlogs, nonExistingId, blogsInDb
}