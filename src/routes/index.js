const router = require('controllers/api/v1.1/index.routes');
const logger = require("logging");

const mountRoutes = (app) => {
  // Intercept body JSON error to overwrite the existing error message
  app.use((error, req, res, next) => {
    if (
      error instanceof SyntaxError &&
      error.status === 400 &&
      "body" in error
    ) {
      logger.error(error);
    }
    next();
  });
  app.use("/api/v1.1", router);
};

module.exports = {
  mountRoutes,
};
