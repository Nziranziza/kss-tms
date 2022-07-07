const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const validateSchedule = (data) => {
  const schema = Joi.object({
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
      prov_id: Joi.objectId().required(),
      dist_id: Joi.objectId().required(),
      sect_id: Joi.objectId().required(),
      cell_id: Joi.objectId().required(),
      village_id: Joi.objectId().required(),
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
  });

  const { error, value } = schema.validate(data);
  if (error) {
    throw error;
  } else {
    return value;
  }
};

const validateRecordAtt = (data) => {
  const schema = Joi.object({
    trainees: Joi.array().items(
      Joi.object({
        _id: Joi.objectId().required(),
        attended: Joi.boolean().required(),
      })
    ),
    notes: Joi.string().required(),
  });
  const { error, value } = schema.validate(data);
  if (error) {
    throw error;
  } else {
    return value;
  }
};

module.exports.validateSchedule = validateSchedule;
module.exports.validateRecordAtt = validateRecordAtt;
