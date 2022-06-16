const createHttpError = require('http-errors');
const Validators = require('../controllers/api/v1.1/validators');
const responseWrapper = require("../core/helpers/responseWrapper");
const {statusCodes} = require("../utils/constants/common");

module.exports = function (validator) {
    // If validator is not exist, throw err
    if (!Validators.hasOwnProperty(validator))
        throw new Error(`'${validator}' validator is not exist`);

    return async function (req, res, next) {
        const error = await Validators[validator](req.body);
        if (error !== undefined) {
            if (error.isJoi) {
                return responseWrapper({
                    res,
                    status: statusCodes.BAD_REQUEST,
                    message: error.message
                });
            } else {
                createHttpError(500);
            }
        }
        next();
    };
};
