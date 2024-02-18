const logger = require('./logger')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

const tokenExtractor = (request, response, next) => {
    // console.log("*** TOKEN EXTRACTION ***")
    // console.log("Extracting token from the Authorization header...")
    const authorization = request.get('authorization')

    if (authorization && authorization.startsWith('Bearer ')) {
        // console.log("Authorization method: Bearer")
        // console.log("Getting rid of 'Bearer' prefix...")
        const extractedToken = authorization.replace('Bearer ', '')
        // console.log("Adding pure token to request's 'token' property...")
        request['token'] = extractedToken
        // console.log("Done...")
        // console.log("************************")
    } else {
        // console.log("Token extraction from authorization header went wrong.")
        return response.status(401).json("User is not authorized or authentication method is different.")
    }

    next()
}

const userExtractor = async (request, response, next) => {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!decodedToken.id) {
        return response.status(401).json({
            error: 'userExtractor: Couldn\'t parse id from decoded token.'
        })
    }
    request['user'] = await User.findById(decodedToken.id)
    console.log("User extracted, showing request.user: ", request.user)
    next()
}

const requestLogger = (request, response, next) => {
    logger.info('Method:', request.method)
    logger.info('Path:  ', request.path)
    logger.info('Body:  ', request.body)
    logger.info('---')
    next()
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
    logger.error(error.message)

    //in all other error situations, middleware passes error forward
    // to default Express error handler
    if (error.name === 'CastError') {
        return response.status(400).send({
            error: 'Malformed ID',
            errorMessage: error.message,
            errorBody: error
        })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
        return response.status(400).json({ error: 'expected `username` to be unique' })
    } else if (error.name === 'JsonWebTokenError') {
        return response.status(400).json({ error: 'token missing or invalid' })
    } else if (error.name === 'TokenExpiredError') {
        return response.status(401).json({
            error: 'token expired'
        })
    } else if (error.name === 'TokenExpiredError') {
        return response.status(401).json({
            error: 'token expired'
        })
    }

    next(error)
}

module.exports = {
    tokenExtractor,
    userExtractor,
    requestLogger,
    unknownEndpoint,
    errorHandler
}