let Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const ownerSchema =
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
const validateCreateFarmVisitSchedule = scheduleData => {
    const schema = Joi.object({
        description: Joi.string()
            .required()
            .trim(),
        farms: Joi.array()
            .min(1)
            .max(35)
            .items(
                Joi.object({
                    farmId: Joi.objectId()
                        .required()
                        .label('farm id'),
                    location: Joi.object({
                        prov_id: Joi.objectId()
                            .required()
                            .label('province'),
                        dist_id: Joi.objectId()
                            .required()
                            .label('district'),
                        sect_id: Joi.objectId()
                            .required()
                            .label('sector'),
                        cell_id: Joi.objectId()
                            .required()
                            .label('cell'),
                        village_id: Joi.objectId()
                            .required()
                            .label('village')
                    }).required(),
                    upiNumber: Joi.string(),
                    owner: ownerSchema
                })
            ),
        gap: Joi.array()
            .min(1)
            .max(35)
            .items({
                gap: Joi.objectId()
                    .required()
                    .label('gap')
            })
            .unique('members.gap'),
        reference: Joi.string().trim(),
        groupId: Joi.objectId()
            .required()
            .label('group')
    });
    return schema.validate(scheduleData).value;
}

module.exports.validateCreateFarmVisitSchedule = validateCreateFarmVisitSchedule;
