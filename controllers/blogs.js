const blogsRouter = require('express').Router()
const Blog = require('./../models/blog')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({})
    response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
    const body = request.body

    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes || 0,
    })

    if (!blog.title) {
        response.status(400).json("Blog title is missing")
    } else if (!blog.url) {
        response.status(400).json("Blog url is missing")
    } else if (!blog.author) {
        response.status(400).json("Blog author is missing")
    } else {
        const savedBlog = await blog.save()
        response.status(201).json(savedBlog)
    }
})

blogsRouter.get('/:id', async (request, response) => {
    const blog = await Blog.findById(request.params.id)
    if (blog) {
        response.json(blog)
    } else {
        response.status(404).end()
    }
})

blogsRouter.delete('/:id', async (request, response) => {
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
    const { title, author, url, likes } = request.body

    const updatedBlog = await Blog.findByIdAndUpdate(
        request.params.id,
        { title, author, url, likes },
        {
            new: true,
            runValidators: true,
            context: 'query'
        }
    )
    response.json(updatedBlog)
})

module.exports = blogsRouter