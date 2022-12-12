const Joi = require("joi");
const { trainingStatus } = require("tools/constants");
Joi.objectId = require("joi-objectid")(Joi);

module.exports.validateTraining = Joi.object({
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
});

module.exports.validateUpdateTraining = Joi.object({
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
    .valid(
      trainingStatus.CONDUCTED,
      trainingStatus.NOT_SCHEDULED,
      trainingStatus.SCHEDULED,
    )
    .required(),
  applicationId: Joi.number().required(),
});
