const config = require('./utils/config')
const express = require('express')
require('express-async-errors') // before I export my routes
const app = express()
const cors = require('cors')
const loginRouter = require('./controllers/login')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')
const morgan = require('morgan')

morgan.token('reqBody', function getId(req) {
    return JSON.stringify(req.body)
})

mongoose.set('strictQuery', false)

logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
    .then(() => {
        logger.info('connected to MongoDB')
    })
    .catch((error) => {
        logger.error('error connecting to MongoDB:', error.message)
    })

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(middleware.requestLogger)
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :reqBody'))     // using morgan middleware

app.use(middleware.tokenExtractor)
app.use('/api/login', loginRouter)
// use the middleware only in /api/blogs routes
app.use('/api/blogs', middleware.userExtractor, blogsRouter)
app.use('/api/users', usersRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
