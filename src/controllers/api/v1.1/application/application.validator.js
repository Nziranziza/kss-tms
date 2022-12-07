const Joi = require('joi');

module.exports.validateApplication = Joi.object({
  applicationName: Joi.string()
    .required()
    .trim().label('application name'),
  applicationId: Joi.number()
    .required()
    .label('application id'),
  description: Joi.string().required()
});
