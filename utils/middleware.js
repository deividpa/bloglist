// utils/middleware.js

const jwt = require('jsonwebtoken')
const logger = require('./logger')
const User = require('../models/User')

// Middleware for logging requests
const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:', request.path)
  logger.info('Body:', request.body)
  logger.info('---')
  next()
}

// Middleware for handling unknown endpoints
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// Middleware for handling errors
const errorHandler = (error, request, response, next) => {
    logger.error(error.message)
    
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
      return response.status(400).json({ error: 'expected `username` to be unique' })
    } else if (error.name ===  'JsonWebTokenError') {
      return response.status(401).json({ error: 'token invalid' })
    } else if (error.name === 'TokenExpiredError') {
      return response.status(401).json({
        error: 'token expired'
      })
    }
    
    next(error)
}

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization');

  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    request.token = authorization.substring(7);
  } else {
    request.token = null;
  }

  next();
};

const userExtractor = async (request, response, next) => {
  // Extract token from request
  const token = request.token;

  // If token is missing, return error
  if (!token) {
    return response.status(401).json({ error: 'Token missing' });
  }

  // Verify token
  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'Token invalid' });
  }
  // Find user based on token
  const user = await User.findById(decodedToken.id);
  if (!user) {
    return response.status(401).json({ error: 'User not found' });
  }

  // Attach user to request object
  request.user = user;
  next();
};


module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor
}