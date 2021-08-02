const ErrRes = require('../utils/errRes');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  // Log to console for dev
  console.log(err);
  // Mongoose Error Resource not found (bad objectId)
  if (err.name === 'CastError') {
    const message = `Resource not found with id ${err.value}`;
    error = new ErrRes(message, 404);
  }
  // Mongoose Error Duplicate key
  if (err.code === 11000) {
    const message = `Duplicate field value entered`;
    error = new ErrRes(message, 400);
  }
  // Mongoose Error validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrRes(message, 400);
  }
  console.log(err.name);
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};

module.exports = errorHandler;
