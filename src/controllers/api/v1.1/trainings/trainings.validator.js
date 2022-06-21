const Joi = require("@hapi/joi");
const { trainingStatus } = require("../../../../tools/constants");
Joi.objectId = require("joi-objectid")(Joi);

const validateTraining = (data) => {
  const schema = {
    trainingName: Joi.string().required(),
    adoptionGaps: Joi.array().items(Joi.objectId()),
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

const validateUpdate = (data) => {
  const schema = {
    _id: Joi.objectId(),
    trainingName: Joi.string().required(),
    adoptionGaps: Joi.array().items(Joi.objectId()),
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
    status: Joi.string()
      .valid([
        trainingStatus.CONDUCTED,
        trainingStatus.NOT_SCHEDULED,
        trainingStatus.SCHEDULED,
      ])
      .required(),
    applicationId: Joi.number().required(),
  };
  return Joi.validate(data, schema);
};

module.exports.validateTraining = validateTraining;
module.exports.validateUpdate = validateUpdate;
