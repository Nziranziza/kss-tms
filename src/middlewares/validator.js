const createHttpError = require("http-errors");
const Validators = require("../controllers/api/v1.1/validators");
const responseWrapper = require("../core/helpers/responseWrapper");
const { statusCodes } = require("../utils/constants/common");

module.exports = function (validator) {
  // If validator is not exist, throw err
  if (!Validators.hasOwnProperty(validator))
    throw new Error(`'${validator}' validator is not exist`);

  return async function (req, res, next) {
    try {
      await Validators[validator](req.body);
      next();
    } catch (err) {
      //* Pass err to next
      //! If validation error occurs call next with HTTP 422. Otherwise HTTP 500
      console.log(err);
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
