const errorHandler = (err, req, res, next) => {
  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Internal server error';

  if (process.env.NODE_ENV === 'development') console.error('Error:', err);

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map(e => e.message).join(', ');
  } else if (err.code === 11000) {
    status = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid ID format';
  } else if (err.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Invalid token';
  }

  res.status(status).json({ message, ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}) });
};

module.exports = errorHandler;
