const createError = statusCode => (message, code) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

const HTTP = {
  badRequest: createError(400),
  unauthorized: createError(401),
  forbidden: createError(403),
  notFound: createError(404),
  internalServerError: createError(500)
};

export {
  HTTP
};