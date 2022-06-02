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
    meetingSchedule: Joi.string().label('meeting schedule')
        .trim(),
    description: Joi.string()
        .required()
        .trim(),
    applicationId: Joi.number()
        .required()
        .label('application id')
  });
  return schema.validate(groupData).value;
};

module.exports.validateGroup = validateGroup;
