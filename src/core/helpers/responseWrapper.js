const responseWrapper = ({ res, status, message, data, error = {} }) => {
  if (!Object.keys(error).length) {
    return res.status(status).json({
      status,
      message,
      data
    });
  }
  return res.status(status).json({
    status,
    message,
    error
  });
};

module.exports = responseWrapper;
