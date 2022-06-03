const createHttpError = require('http-errors');
const Validators = require('../controllers/api/v1.1/validators');

module.exports = function(validator) {
  // If validator is not exist, throw err
  if (!Validators.hasOwnProperty(validator))
    throw new Error(`'${validator}' validator is not exist`);

  return async function(req, res, next) {
    try {
      req.body = await Validators[validator](req.body);
      next();
    } catch (err) {
      if (err.isJoi) {
        return res.status(422).send({status: 422, errors: err.message});
      }
      else {
        next(createHttpError(500));
      }
    }
  };
};
