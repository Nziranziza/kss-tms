let Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const validateMembers = membersData => {
  const schema = Joi.object({
    groupId: Joi.objectId().required().label('group reference'),
    members: Joi.array().items({
      userId: Joi.objectId().required().label('user id'),
      firstName: Joi.string().label('first name'),
      lastName: Joi.string().label('last name'),
      regNumber: Joi.string().label('reg number'),
      nid: Joi.string(),
      groupName: Joi.string().label('group name'),
      groupContactPersonNames: Joi.string().label('group contact person names'),
      groupContactPersonPhoneNumber: Joi.string().label('group contact person phone number'),
      phoneNumber: Joi.string().label('phone number'),

    }).unique('members.userId'),
    applicationId: Joi.number().label('application id'),
  });
  return schema.validate(membersData).value;
};

module.exports.validateMembers = validateMembers;
