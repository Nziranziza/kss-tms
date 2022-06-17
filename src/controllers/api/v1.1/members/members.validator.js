let Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const validateMembers = membersData => {
  const schema = Joi.object({
    groupId: Joi.objectId().required().label('group'),
    members: Joi.array().items({
      userId: Joi.objectId().required().label('user id'),
      firstName: Joi.string().label('first name'),
      lastName: Joi.string().label('last name'),
      regNumber: Joi.string().label('reg number'),
      nid: Joi.string(),
      sex: Joi.string(),
      groupName: Joi.string().label('group name'),
      groupContactPersonNames: Joi.string().label('group contact person names'),
      groupContactPersonPhoneNumber: Joi.string().label('group contact person phone number'),
      phoneNumber: Joi.string().label('phone number')
    })
  });
  return schema.validate(membersData).error;
};

const validateUpdateMembers = members => {
  const schema = Joi.object({
    members: Joi.array().items({
      userId: Joi.objectId().required().label('user id'),
      firstName: Joi.string().label('first name'),
      lastName: Joi.string().label('last name'),
      regNumber: Joi.string().label('reg number'),
      nid: Joi.string(),
      sex: Joi.string(),
      groupName: Joi.string().label('group name'),
      groupContactPersonNames: Joi.string().label('group contact person names'),
      groupContactPersonPhoneNumber: Joi.string().label('group contact person phone number'),
      phoneNumber: Joi.string().label('phone number')

    }).min(1)
  });
  return schema.validate(members).error;
};
module.exports.validateMembers = validateMembers;
module.exports.validateUpdateMembers = validateUpdateMembers;
