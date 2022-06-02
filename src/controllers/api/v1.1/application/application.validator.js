const Joi = require('joi');
const validateApplication = applicationData => {
  const schema = Joi.object({
    applicationName: Joi.string()
          .required()
          .trim().label('application name'),
    applicationId: Joi.number()
      .required()
        .label('application id'),
    description: Joi.string().required()
  });
  return schema.validate(applicationData).value;
};

module.exports.validateApplication = validateApplication;
