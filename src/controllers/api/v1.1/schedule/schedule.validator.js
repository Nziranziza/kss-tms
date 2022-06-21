const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

const validateSchedule = (data) => {
  const schema = {
    trainingId: Joi.objectId().required(),
    trainerId: Joi.objectId().required(),
    referenceId: Joi.objectId().required(),
    description: Joi.string().required(),
    location: Joi.object({
      provId: Joi.objectId().required(),
      distId: Joi.objectId().required(),
      sectId: Joi.objectId().required(),
      cellId: Joi.objectId().required(),
      villageId: Joi.objectId().required(),
    }).required(),
    venueName: Joi.string().required(),
    startTime: Joi.date().required(),
    endTime: Joi.date().required(),
    trainees: Joi.array().items(
      Joi.object({
        userId: Joi.objectId().required(),
        foreName: Joi.string().required(),
        surName: Joi.string().required(),
        gender: Joi.string().required(),
        regNumber: Joi.string().required(),
        phoneNumber: Joi.string(),
      })
    ),
    applicationId: Joi.number().required(),
  };
  return Joi.validate(data, schema);
};

module.exports.validateSchedule = validateSchedule;
