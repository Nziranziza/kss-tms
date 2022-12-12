const createHttpError = require("http-errors");
const Validators = require("../controllers/api/v1.1/validators");
const responseWrapper = require("../core/helpers/responseWrapper");
const { statusCodes } = require("../utils/constants/common");

module.exports = function (validator) {
  // If validator does not exist, throw err
  if (!Validators[validator]) {
    throw new Error(`'${validator}' validator is not exist`);
  }

  if (typeof Validators[validator]?.validate !== "function") {
    throw new Error(`'${validator}' validator is not valid`);
  }

  return function (req, res, next) {
    try {
      const { error } = Validators[validator].validate(req.body);
      if (error) {
        throw error;
      }
      next();
    } catch (err) {
      //* Pass err to next
      //! If validation error occurs call next with HTTP 422. Otherwise HTTP 500
      if (err.isJoi)
        return responseWrapper({
          res,
          status: statusCodes.BAD_REQUEST,
          message: err.message,
        });
      else next(createHttpError(500));
    }
  };
};
