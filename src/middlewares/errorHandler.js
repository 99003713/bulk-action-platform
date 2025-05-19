// src/middlewares/errorHandler.js

const { logger } = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  
  if (err.statusCode) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  
  res.status(500).json({
    message: 'Internal server error',
    details: err.message,
  });
};

module.exports = errorHandler;