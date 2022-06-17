let Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const validateGroup = groupData => {
  const schema = Joi.object({
    groupName: Joi.string()
        .required()
        .trim().label('group name'),
    leaderNames: Joi.string()
          .required()
          .trim().label('group leader names'),
    leaderPhoneNumber: Joi.string()
        .required()
        .trim().label('group leader phone number'),
    location: Joi.object({
      prov_id: Joi.objectId().required().label('province'),
      dist_id: Joi.objectId().required().label('district'),
      sect_id: Joi.objectId().required().label('sector'),
      cell_id: Joi.objectId().required().label('cell'),
      village_id: Joi.objectId().required().label('village')
    }).required(),
    meetingSchedule: Joi.object({
      meetingDay: Joi.number().label('meeting day'),
      meetingTime: Joi.date().required().label('meeting time')
    }),
    description: Joi.string()
        .required()
        .trim(),
    reference: Joi.string()
  });
  return schema.validate(groupData).error
};

module.exports.validateGroup = validateGroup;
