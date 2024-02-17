const blogsRouter = require('express').Router()
const Blog = require('./../models/blog')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
    response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
    const body = request.body
    const user = request.user
    
    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes || 0,
        user: user._id.toString(),
    })

    if (body.title === undefined || body.author === undefined ||
        body.url === undefined) {
        response.status(400).json("title, url or author are undefined").end()
    } else {
        const savedBlog = await blog.save()
        user.blogs = user.blogs.concat(savedBlog._id)
        await user.save()

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
    const user = request.user

    const blog = await Blog.findById(request.params.id)
    if (blog.user.toString() === user.id.toString()) {
        await Blog.findByIdAndRemove(request.params.id)
        response.status(204).end()
    } else {
        response.status(400).json("Deleting a blog is attempted without a token or by an invalid user.")
    }
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