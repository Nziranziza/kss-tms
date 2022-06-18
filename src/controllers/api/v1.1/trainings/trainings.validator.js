const Joi = require("@hapi/joi");

const validateTraining = (data) => {
  const schema = {
    trainingName: Joi.string().required(),
    adoptionGap: Joi.string().required().trim(),
    description: Joi.string().required(),
    materials: Joi.array()
      .items(
        Joi.object({
          fileName: Joi.string().required(),
          url: Joi.string().uri().required(),
        })
      )
      .required(),
    applicationId: Joi.number().required(),
  };
  return Joi.validate(data, schema);
};

const validateUpdateTraining = (data) => {
  const schema = {
    _id: Joi.string(),
    trainingName: Joi.string().required(),
    adoptionGap: Joi.string().required().trim(),
    description: Joi.string().required(),
    materials: Joi.array()
      .items(
        Joi.object({
          _id: Joi.string(),
          fileName: Joi.string().required(),
          url: Joi.string().uri().required(),
        })
      )
      .required(),
    applicationId: Joi.number().required(),
  };
  return Joi.validate(data, schema);
}

module.exports.validateTraining = validateTraining;
module.exports.validateUpdateTraining = validateUpdateTraining;
