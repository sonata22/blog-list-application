const logger = require('./../utils/logger')
const blogsRouter = require('express').Router()
const Blog = require('./../models/blog')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({})
    response.json(blogs)
})

blogsRouter.post('/', (request, response, next) => {
    const blog = new Blog(request.body)

    if (!blog.title) {
        response.status(400).json("Blog title is missing")
    } else {
        blog.save()
            .then(savedBlog => {
                response.status(201).json(savedBlog)
            })
            .catch(error => next(error))
    }
})

module.exports = blogsRouter