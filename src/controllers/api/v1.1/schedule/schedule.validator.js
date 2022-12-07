const Joi = require("joi").extend(require("@joi/date"));
Joi.objectId = require("joi-objectid")(Joi);

module.exports.validateSchedule = Joi.object({
  trainingId: Joi.objectId().required(),
  trainer: Joi.object({
    userId: Joi.objectId().required(),
    fullName: Joi.string().required(),
    phoneNumber: Joi.string(),
    organisationName: Joi.string().required(),
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

module.exports.validateUpdateSchedule = Joi.object({
  _id: Joi.objectId().required(),
  trainingId: Joi.objectId().required(),
  trainer: Joi.object({
    _id: Joi.objectId().required(),
    userId: Joi.objectId().required(),
    fullName: Joi.string().required(),
    phoneNumber: Joi.string(),
    organisationName: Joi.string().required(),
  }).required(),
  groupId: Joi.objectId().required(),
  referenceId: Joi.objectId().required(),
  description: Joi.string().required(),
  location: Joi.object({
    _id: Joi.objectId().required(),
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
      _id: Joi.objectId(),
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

module.exports.validateRecordAtt = Joi.object({
  trainees: Joi.array().items(
    Joi.object({
      _id: Joi.objectId().required(),
      attended: Joi.boolean().required(),
    })
  ),
  notes: Joi.string().required(),
});

module.exports.validateEditAtt = Joi.object({
  trainees: Joi.array().items(
    Joi.object({
      _id: Joi.objectId().required(),
      attended: Joi.boolean().required(),
    })
  ),
  notes: Joi.string().required(),
  lastUpdatedBy: Joi.object({
    userId: Joi.objectId().required(),
    fullName: Joi.string().required(),
    phoneNumber: Joi.string(),
    organisationName: Joi.string().required(),
  }).required(),
});

module.exports.validateStats = Joi.object({
  trainingId: Joi.objectId(),
  trainerId: Joi.objectId(),
  scheduleId: Joi.objectId(),
  referenceId: Joi.objectId(),
  groupId: Joi.objectId(),
  location: Joi.object({
    searchBy: Joi.string()
      .valid("prov_id", "dist_id", "sect_id", "cell_id", "village_id")
      .required(),
    locationId: Joi.objectId().required(),
  }),
  date: Joi.object({
    from: Joi.date().format("YYYY-MM-DD").required(),
    to: Joi.date().format("YYYY-MM-DD").required(),
  }),
});

module.exports.validateFilterSchedule = Joi.object({
  date: Joi.date().format("YYYY-mm-dd"),
});
