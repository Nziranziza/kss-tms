let Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const memberSchema =
    Joi.object({
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
    });

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
        reference: Joi.string(),
        applicationId: Joi.number().required(),
        members: Joi.array().items(memberSchema).min(1)
    });
    return schema.validate(groupData).error
};
const validateUpdateProfile = profileData => {
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
            .trim()
    });
    return schema.validate(profileData).error
};
const validateUpdateMembers = membersData => {
    const schema = Joi.object({
        members: Joi.array().items(memberSchema).min(1)
    });
    return schema.validate(membersData).error;
};

module.exports.validateGroup = validateGroup;
module.exports.validateUpdateProfile = validateUpdateProfile;
module.exports.validateUpdateMembers = validateUpdateMembers;
