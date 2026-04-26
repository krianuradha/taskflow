const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};// A higher-order function that wraps an async route handler and catches any errors, passing them to the next middleware (error handler).

export { asyncHandler };