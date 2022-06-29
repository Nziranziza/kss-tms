const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

const validateSchedule = (data) => {
  const schema = {
    trainingId: Joi.objectId().required(),
    trainer: Joi.object({
      userId: Joi.objectId().required(),
      fullName: Joi.string().required(),
      phoneNumber: Joi.string(),
    }).required(),
    groupId: Joi.objectId().required(),
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
        groupId: Joi.objectId().required(),
        foreName: Joi.string().required(),
        surName: Joi.string().required(),
        gender: Joi.string().required(),
        regNumber: Joi.string().required(),
        phoneNumber: Joi.string(),
      })
    ),
  };
  return Joi.validate(data, schema);
};

const validateRecordAtt = (data) => {
  const schema = {
    trainees: Joi.array().items(
      Joi.object({
        _id: Joi.objectId().required(),
        attended: Joi.boolean().required()
      })
    ),
    notes: Joi.string().required(),
  };
  return Joi.validate(data, schema);
};

module.exports.validateSchedule = validateSchedule;
module.exports.validateRecordAtt = validateRecordAtt;
