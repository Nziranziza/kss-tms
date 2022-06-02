const v1_1 = require('../controllers/api/v1.1/index.routes');
const logger = require('../utils/logging');

const mountRoutes = app => {
    // Intercept body JSON error to overwrite the existing error message
    app.use((error, req, res, next) => {
        if (
            error instanceof SyntaxError &&
            error.status === 400 &&
            'body' in error
        ) {
            logger.error(error);
            next();
        } else next();
    });
    // V 1.1
    app.use('/api/v1.1', v1_1);
}

module.exports = {
    mountRoutes
};